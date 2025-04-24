<?php
// Database configuration
require_once 'db.php';
require_once 'session.php';
validateSession(true);

ini_set('display_errors', '0'); // Disable error display to the browser
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json');

// Database connection
$host = 'localhost'; // Change as needed
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'dinalben';
$password = '50409149';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the input data
    $input = json_decode(file_get_contents('php://input'), true);
    $lost_item_id = isset($input['lost_item_id']) ? intval($input['lost_item_id']) : null;
    $found_item_id = isset($input['found_item_id']) ? intval($input['found_item_id']) : null;

    // Validate input
    if ($lost_item_id === null || $found_item_id === null) {
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Prepare and bind the SQL statement for creating a match
        $stmt = $conn->prepare("INSERT INTO matches (lost_item_id, found_item_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $lost_item_id, $found_item_id);

        // Execute the statement
        if (!$stmt->execute()) {
            throw new Exception("Failed to match items");
        }
        
        // Try to get details about the lost item and its owner
        try {
            $lostItemQuery = $conn->prepare("
                SELECT li.name, li.user_id 
                FROM lost_items li 
                WHERE li.id = ?
            ");
            $lostItemQuery->bind_param("i", $lost_item_id);
            
            if ($lostItemQuery->execute()) {
                $lostResult = $lostItemQuery->get_result();
                $lostDetails = $lostResult->fetch_assoc();
                
                // Log lost item details for debugging only in error log
                error_log("Lost item details: " . print_r($lostDetails, true));
            } else {
                error_log("Failed to get lost item details");
            }
        } catch (Exception $e) {
            error_log("Error getting lost item details: " . $e->getMessage());
        }

        // Try to get details about the found item and its finder
        try {
            $foundItemQuery = $conn->prepare("
                SELECT fi.item_name, fi.user_id 
                FROM found_items fi 
                WHERE fi.id = ?
            ");
            $foundItemQuery->bind_param("i", $found_item_id);
            
            if ($foundItemQuery->execute()) {
                $foundResult = $foundItemQuery->get_result();
                $foundDetails = $foundResult->fetch_assoc();
                
                // Log found item details for debugging only in error log
                error_log("Found item details: " . print_r($foundDetails, true));
            } else {
                error_log("Failed to get found item details");
            }
        } catch (Exception $e) {
            error_log("Error getting found item details: " . $e->getMessage());
        }
        
        // Try to notify the users using direct database insertion if notification_helper.php is available
        if (file_exists('notification_helper.php')) {
            try {
                require_once 'notification_helper.php';
                
                // Notify the person who lost the item
                if (isset($lostDetails) && isset($lostDetails['user_id'])) {
                    $lostUserId = $lostDetails['user_id'];
                    $itemName = $lostDetails['name'] ?? 'Item';
                    
                    // Create retrieval link without item ID - user will select from available items
                    $retrieveLink = "/retrieve-form";
                    
                    $notifyResult = createNotification(
                        $lostUserId,
                        'Item Match Found',
                        "A $itemName matching your lost item description has been found.",
                        'success',
                        $retrieveLink,
                        "Good news! We've found an item that matches your lost $itemName. Please click here to submit a retrieval form to claim your item. You'll be able to select the matching item from the list of available items. You'll need to verify your identity when picking up the item."
                    );
                    error_log("createNotification result for lost user $lostUserId: " . ($notifyResult ? "Success (ID: $notifyResult)" : "Failed"));
                }
                
                // Notify the person who found the item
                if (isset($foundDetails) && isset($foundDetails['user_id'])) {
                    $foundUserId = $foundDetails['user_id'];
                    $itemName = $foundDetails['item_name'] ?? 'Item';
                    
                    $notifyResult = createNotification(
                        $foundUserId,
                        'Match Found for Your Found Item',
                        "Someone has reported losing a $itemName that matches what you found.",
                        'success',
                        "/found-items",
                        "Good news! We've identified the potential owner of the $itemName you found. Thank you for your help! The item owner has been notified to complete the retrieval form."
                    );
                    error_log("createNotification result for found user $foundUserId: " . ($notifyResult ? "Success (ID: $notifyResult)" : "Failed"));
                }
            } catch (Exception $e) {
                error_log("Error with notifications: " . $e->getMessage());
                // Continue execution even if notifications fail
            }
        } else {
            // Try direct database insertions for notifications if helper file isn't available
            error_log("notification_helper.php not found, attempting direct notification insertions");
            
            try {
                if (isset($lostDetails) && isset($lostDetails['user_id'])) {
                    $lostUserId = $lostDetails['user_id'];
                    $itemName = $lostDetails['name'] ?? 'Item';
                    $title = 'Item Match Found';
                    $message = "A $itemName matching your lost item description has been found.";
                    $type = 'success';
                    $link = "/retrieve-form";
                    $details = "Good news! We've found an item that matches your lost $itemName. Please click here to submit a retrieval form to claim your item. You'll be able to select the matching item from the list of available items.";
                    
                    $directStmt = $conn->prepare("INSERT INTO notification_system 
                        (user_id, title, message, type, link, details) VALUES (?, ?, ?, ?, ?, ?)");
                    $directStmt->bind_param("isssss", $lostUserId, $title, $message, $type, $link, $details);
                    $directStmt->execute();
                }
                
                if (isset($foundDetails) && isset($foundDetails['user_id'])) {
                    $foundUserId = $foundDetails['user_id'];
                    $itemName = $foundDetails['item_name'] ?? 'Item';
                    $title = 'Match Found for Your Found Item';
                    $message = "Someone has reported losing a $itemName that matches what you found.";
                    $type = 'success';
                    $link = "/found-items";
                    $details = "Good news! We've identified the potential owner of the $itemName you found. Thank you for your help! The item owner has been notified to complete the retrieval form.";
                    
                    $directStmt = $conn->prepare("INSERT INTO notification_system 
                        (user_id, title, message, type, link, details) VALUES (?, ?, ?, ?, ?, ?)");
                    $directStmt->bind_param("isssss", $foundUserId, $title, $message, $type, $link, $details);
                    $directStmt->execute();
                }
            } catch (Exception $e) {
                error_log("Error with direct notifications: " . $e->getMessage());
                // Continue execution even if notifications fail
            }
        }

        // Commit the transaction
        $conn->commit();

        echo json_encode(["success" => true, "message" => "Items matched successfully"]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        error_log("Transaction rollback due to error: " . $e->getMessage());
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Invalid request method"]);
}
  
$conn->close();
?>