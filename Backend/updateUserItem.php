<?php
session_start();
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'your_username';
$password = 'your_password';

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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id']) || !isset($input['item_type']) || !isset($input['action'])) {
    echo json_encode(["success" => false, "message" => "Missing required parameters"]);
    exit;
}

$itemId = $input['id'];
$itemType = $input['item_type']; // Either 'lost' or 'found'
$action = $input['action']; // Either 'edit' or 'delete'

try {
    // First verify that the item belongs to the user
    if ($itemType === 'lost') {
        $checkQuery = $conn->prepare("SELECT id FROM lost_items WHERE id = ? AND user_id = ?");
    } else {
        $checkQuery = $conn->prepare("SELECT id FROM found_items WHERE id = ? AND user_id = ?");
    }
    
    $checkQuery->bind_param("ii", $itemId, $userId);
    $checkQuery->execute();
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
        // Handle edit action based on item type
        if ($itemType === 'lost') {
            $updateQuery = $conn->prepare("
                UPDATE lost_items 
                SET 
                    name = ?,
                    date = ?,
                    last_seen_location = ?,
                    description = ?
                WHERE id = ?
            ");
            
            $name = $input['item_name'];
            $date = $input['date'];
            $location = $input['location'];
            $description = $input['description'];
            
            $updateQuery->bind_param("ssssi", $name, $date, $location, $description, $itemId);
        } 
        else {
            $updateQuery = $conn->prepare("
                UPDATE found_items 
                SET 
                    item_name = ?,
                    date_found = ?,
                    location_found = ?,
                    description = ?
                WHERE id = ?
            ");
            
            $name = $input['item_name'];
            $date = $input['date'];
            $location = $input['location'];
            $description = $input['description'];
            
            $updateQuery->bind_param("ssssi", $name, $date, $location, $description, $itemId);
        }
        
        $updateQuery->execute();
        
        echo json_encode(["success" => true, "message" => "Item updated successfully"]);
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