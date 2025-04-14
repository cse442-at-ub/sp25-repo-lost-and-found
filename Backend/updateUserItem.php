<?php
session_start();
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'shanoyah';
$password = '50400377';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit;
}

$userId = $_SESSION['user_id'];

// Determine if we're processing form data or JSON
$isFormData = isset($_FILES['image']) || ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false);

if ($isFormData) {
    // Process form data
    $itemId = $_POST['id'] ?? null;
    $itemType = $_POST['item_type'] ?? null;
    $action = $_POST['action'] ?? null;
} else {
    // Process JSON data
    $input = json_decode(file_get_contents('php://input'), true);
    $itemId = $input['id'] ?? null;
    $itemType = $input['item_type'] ?? null;
    $action = $input['action'] ?? null;
}

// Validate required parameters
if (!$itemId || !$itemType || !$action) {
    echo json_encode(["success" => false, "message" => "Missing required parameters"]);
    exit;
}

// Values are already assigned above in the form/JSON detection section

try {
    // First verify that the item belongs to the user
    if ($itemType === 'lost') {
        $checkQuery = $conn->prepare("SELECT id FROM lost_items WHERE id = ? AND user_id = ?");
    } else {
        $checkQuery = $conn->prepare("SELECT id FROM found_items WHERE id = ? AND user_id = ?");
    }
    
    if (!$checkQuery) {
        echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
        exit;
    }
    
    $checkQuery->bind_param("ii", $itemId, $userId);
    $checkResult = $checkQuery->execute();
    
    if (!$checkResult) {
        echo json_encode(["success" => false, "message" => "Error checking item ownership: " . $checkQuery->error]);
        exit;
    }
    
    $result = $checkQuery->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Item not found or you don't have permission to modify it"]);
        exit;
    }
    
    // Process based on action
    if ($action === 'delete') {
        // Begin transaction for the archiving process
        $conn->begin_transaction();
        
        try {
            if ($itemType === 'lost') {
                // Copy the item to the archive table
                $archiveQuery = $conn->prepare("
                    INSERT INTO archived_lost_items 
                    SELECT *, NOW() as archived_at FROM lost_items 
                    WHERE id = ? AND user_id = ?
                ");
                $archiveQuery->bind_param("ii", $itemId, $userId);
                $archiveQuery->execute();
                
                // Delete from the active table
                $deleteQuery = $conn->prepare("DELETE FROM lost_items WHERE id = ? AND user_id = ?");
                $deleteQuery->bind_param("ii", $itemId, $userId);
                $deleteQuery->execute();
            } else {
                // Copy the item to the archive table
                $archiveQuery = $conn->prepare("
                    INSERT INTO archived_found_items 
                    SELECT *, NOW() as archived_at FROM found_items 
                    WHERE id = ? AND user_id = ?
                ");
                $archiveQuery->bind_param("ii", $itemId, $userId);
                $archiveQuery->execute();
                
                // Delete from the active table
                $deleteQuery = $conn->prepare("DELETE FROM found_items WHERE id = ? AND user_id = ?");
                $deleteQuery->bind_param("ii", $itemId, $userId);
                $deleteQuery->execute();
            }
            
            // Commit the transaction
            $conn->commit();
            
            echo json_encode(["success" => true, "message" => "Item archived successfully"]);
        } catch (Exception $e) {
            // Rollback on error
            $conn->rollback();
            echo json_encode(["success" => false, "message" => "Error archiving item: " . $e->getMessage()]);
        }
    } 
    else if ($action === 'edit') {
        // Get the form/input values
        if ($isFormData) {
            $name = $_POST['item_name'];
            $date = $_POST['date'];
            $location = $_POST['location'];
            $description = $_POST['description'];
        } else {
            $name = $input['item_name'];
            $date = $input['date'];
            $location = $input['location'];
            $description = $input['description'];
        }
        
        // Check if an image was uploaded
        $newImagePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            // Process the uploaded image
            $uploadDir = "uploads/";
            
            // Create the upload directory if it doesn't exist
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Generate a unique filename
            $imageFileName = time() . "_" . basename($_FILES['image']['name']);
            $uploadPath = $uploadDir . $imageFileName;
            
            // Move the uploaded file
            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
                $newImagePath = $uploadPath;
                error_log("File uploaded successfully to: " . $newImagePath);
            } else {
                $errorDetails = [
                    'php_error' => error_get_last(),
                    'upload_path' => $uploadPath,
                    'tmp_name' => $_FILES['image']['tmp_name']
                ];
                error_log("Failed to move uploaded file: " . json_encode($errorDetails));
                
                echo json_encode([
                    "success" => false, 
                    "message" => "Failed to upload image. Please try again.",
                    "debug" => $errorDetails
                ]);
                exit;
            }
        } else if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            $errorCodes = [
                1 => "The uploaded file exceeds the upload_max_filesize directive in php.ini",
                2 => "The uploaded file exceeds the MAX_FILE_SIZE directive specified in the HTML form",
                3 => "The uploaded file was only partially uploaded",
                4 => "No file was uploaded",
                6 => "Missing a temporary folder",
                7 => "Failed to write file to disk",
                8 => "A PHP extension stopped the file upload"
            ];
            
            $errorMessage = isset($errorCodes[$_FILES['image']['error']]) ? 
                            $errorCodes[$_FILES['image']['error']] : 
                            "Unknown upload error";
            
            error_log("File upload error: " . $errorMessage);
            
            echo json_encode([
                "success" => false, 
                "message" => "Upload error: " . $errorMessage,
                "error_code" => $_FILES['image']['error']
            ]);
            exit;
        }
        
        // Begin transaction
        $conn->begin_transaction();
        
        try {
            // Handle edit action based on item type
            if ($itemType === 'lost') {
                if ($newImagePath) {
                    // Include image update
                    $updateQuery = $conn->prepare("
                        UPDATE lost_items 
                        SET 
                            name = ?,
                            date = ?,
                            last_seen_location = ?,
                            description = ?,
                            file_path = ?
                        WHERE id = ? AND user_id = ?
                    ");
                    $updateQuery->bind_param("sssssii", $name, $date, $location, $description, $newImagePath, $itemId, $userId);
                } else {
                    // No image update
                    $updateQuery = $conn->prepare("
                        UPDATE lost_items 
                        SET 
                            name = ?,
                            date = ?,
                            last_seen_location = ?,
                            description = ?
                        WHERE id = ? AND user_id = ?
                    ");
                    $updateQuery->bind_param("ssssii", $name, $date, $location, $description, $itemId, $userId);
                }
            } 
            else { // Found item
                if ($newImagePath) {
                    // Include image update
                    $updateQuery = $conn->prepare("
                        UPDATE found_items 
                        SET 
                            item_name = ?,
                            date_found = ?,
                            location_found = ?,
                            description = ?,
                            image = ?
                        WHERE id = ? AND user_id = ?
                    ");
                    $updateQuery->bind_param("sssssii", $name, $date, $location, $description, $newImagePath, $itemId, $userId);
                } else {
                    // No image update
                    $updateQuery = $conn->prepare("
                        UPDATE found_items 
                        SET 
                            item_name = ?,
                            date_found = ?,
                            location_found = ?,
                            description = ?
                        WHERE id = ? AND user_id = ?
                    ");
                    $updateQuery->bind_param("ssssii", $name, $date, $location, $description, $itemId, $userId);
                }
            }
            
            $updateQuery->execute();
            
            // Commit transaction
            $conn->commit();
            
            // Create response
            $response = [
                "success" => true, 
                "message" => "Item updated successfully"
            ];
            
            // Include the new image path in the response if one was uploaded
            if ($newImagePath) {
                $response["image_path"] = $newImagePath;
            }
            
            echo json_encode($response);
            
        } catch (Exception $e) {
            // Rollback on error
            $conn->rollback();
            echo json_encode([
                "success" => false, 
                "message" => "Error updating item: " . $e->getMessage()
            ]);
        }
    }
    else if ($action === 'mark_found') {
        // Only process if this is a lost item
        if ($itemType !== 'lost') {
            echo json_encode(["success" => false, "message" => "Only lost items can be marked as found"]);
            exit;
        }
        
        // Begin transaction for the archiving process
        $conn->begin_transaction();
        
        try {
            // First get all the lost item details
            $getLostItemQuery = $conn->prepare("
                SELECT * FROM lost_items WHERE id = ? AND user_id = ?
            ");
            $getLostItemQuery->bind_param("ii", $itemId, $userId);
            $getLostItemQuery->execute();
            $lostItemResult = $getLostItemQuery->get_result();
            $lostItem = $lostItemResult->fetch_assoc();
            
            if (!$lostItem) {
                throw new Exception("Lost item not found");
            }
            
            // Update the status field in archived_lost_items to indicate it was found
            $archiveQuery = $conn->prepare("
                INSERT INTO archived_lost_items 
                SELECT *, 'found', NOW() as archived_at FROM lost_items 
                WHERE id = ? AND user_id = ?
            ");
            $archiveQuery->bind_param("ii", $itemId, $userId);
            $archiveQuery->execute();
            
            // Delete from the active lost_items table
            $deleteQuery = $conn->prepare("DELETE FROM lost_items WHERE id = ? AND user_id = ?");
            $deleteQuery->bind_param("ii", $itemId, $userId);
            $deleteQuery->execute();
            
            // Optionally, you could also create a record in found_items table
            // This would depend on your system design
            
            // Commit the transaction
            $conn->commit();
            
            echo json_encode(["success" => true, "message" => "Item marked as found and archived successfully"]);
        } catch (Exception $e) {
            // Rollback on error
            $conn->rollback();
            echo json_encode(["success" => false, "message" => "Error marking item as found: " . $e->getMessage()]);
        }
    }
    else {
        echo json_encode(["success" => false, "message" => "Invalid action"]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error updating item: " . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>