<?php
// Simple error handling to prevent output to browser but log to server
ini_set('display_errors', '0');
error_reporting(E_ALL);
ini_set('log_errors', '1');
error_log("Starting claim approval/denial process - INCREMENTAL VERSION");

// Always set JSON header
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'blaketur';
$password = '50519587';

// Simple notification function that doesn't rely on external files
function simpleCreateNotification($conn, $userId, $title, $message, $type = 'info', $link = null, $details = null) {
    try {
        error_log("Attempting to create notification for user $userId with title: $title");
        
        // Check if notification_system table exists
        $tableCheckStmt = $conn->prepare("SHOW TABLES LIKE 'notification_system'");
        if (!$tableCheckStmt) {
            error_log("Failed to prepare table check statement: " . $conn->error);
            return false;
        }
        
        $tableCheckStmt->execute();
        $tableExists = $tableCheckStmt->get_result()->num_rows > 0;
        $tableCheckStmt->close();
        
        if (!$tableExists) {
            error_log("notification_system table does not exist");
            return false;
        }
        
        // Insert notification
        $stmt = $conn->prepare("INSERT INTO notification_system (user_id, title, message, type, link, details) VALUES (?, ?, ?, ?, ?, ?)");
        if (!$stmt) {
            error_log("Failed to prepare notification insert statement: " . $conn->error);
            return false;
        }
        
        $stmt->bind_param("isssss", $userId, $title, $message, $type, $link, $details);
        $success = $stmt->execute();
        
        if (!$success) {
            error_log("Failed to insert notification: " . $stmt->error);
            $stmt->close();
            return false;
        }
        
        $notificationId = $conn->insert_id;
        $stmt->close();
        
        error_log("Successfully created notification ID: $notificationId");
        return $notificationId;
    } catch (Exception $e) {
        error_log("Exception in simpleCreateNotification: " . $e->getMessage());
        return false;
    }
}

try {
    $conn = new mysqli($host, $username, $password, $dbname);

    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        echo json_encode([
            "success" => false, 
            "message" => "Database connection failed. Please try again later."
        ]);
        exit;
    }
} catch (Exception $e) {
    error_log("Error connecting to database: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => "Database connection failed. Please try again later."
    ]);
    exit;
}

// Check for POST request
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Get input data
    $inputJSON = file_get_contents("php://input");
    error_log("Received input: " . $inputJSON);
    
    // Check if JSON is valid
    $input = json_decode($inputJSON, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON parse error: " . json_last_error_msg());
        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON input: " . json_last_error_msg()
        ]);
        exit;
    }
    
    if (!isset($input['id']) || !isset($input['approved'])) {
        echo json_encode(["success" => false, "message" => "Missing required parameters"]);
        exit;
    }

    $id = intval($input['id']); // Ensure ID is an integer
    $approved = $input['approved']; // Can be null, 0, or 1
    $reason = isset($input['reason']) ? $input['reason'] : null; // Optional rejection reason

    // Start transaction
    $conn->begin_transaction();

    try {
        // Prepare and execute query to update claim
        if ($approved == 0 && $reason) {
            // If denying with a reason, store the reason
            $stmt = $conn->prepare("UPDATE claims SET approved = ?, rejection_reason = ? WHERE id = ?");
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $conn->error);
            }
            $stmt->bind_param("isi", $approved, $reason, $id);
        } else {
            // If approving or no reason provided
            $stmt = $conn->prepare("UPDATE claims SET approved = ? WHERE id = ?");
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $conn->error);
            }
            $stmt->bind_param("ii", $approved, $id); 
        }

        if (!$stmt->execute()) {
            throw new Exception("Failed to update claim: " . $stmt->error);
        }

        // Get affected rows to confirm update happened
        $affected = $stmt->affected_rows;
        $stmt->close();
        
        if ($affected <= 0) {
            throw new Exception("No claim found with ID: $id");
        }

        // Get claim details for notification
        $claimDetailsQuery = $conn->prepare("
            SELECT 
                c.user_id,
                c.claim_type,
                c.item_id,
                CASE 
                    WHEN c.claim_type = 'lost' THEN li.name
                    WHEN c.claim_type = 'found' THEN fi.item_name
                    ELSE 'Unknown Item'
                END as item_name
            FROM claims c
            LEFT JOIN lost_items li ON c.claim_type = 'lost' AND c.item_id = li.id
            LEFT JOIN found_items fi ON c.claim_type = 'found' AND c.item_id = fi.id
            WHERE c.id = ?
        ");
        
        if (!$claimDetailsQuery) {
            error_log("Failed to prepare claim details query: " . $conn->error);
            // Continue without notification
            $conn->commit();
            echo json_encode([
                "success" => true, 
                "message" => "Claim " . ($approved == 1 ? "approved" : "denied") . " successfully (without notification)"
            ]);
            exit;
        }
        
        $claimDetailsQuery->bind_param("i", $id);
        
        if (!$claimDetailsQuery->execute()) {
            error_log("Failed to execute claim details query: " . $claimDetailsQuery->error);
            // Continue without notification
            $conn->commit();
            echo json_encode([
                "success" => true, 
                "message" => "Claim " . ($approved == 1 ? "approved" : "denied") . " successfully (without notification)"
            ]);
            exit;
        }
        
        $result = $claimDetailsQuery->get_result();
        $claimDetails = $result->fetch_assoc();
        $claimDetailsQuery->close();

        // If we have claim details, try to send a notification
        if ($claimDetails && isset($claimDetails['user_id'])) {
            $userId = $claimDetails['user_id'];
            $itemName = $claimDetails['item_name'] ?? 'Item';
            
            // Send appropriate notification based on approval status
            if ($approved == 1) {
                // Claim was approved
                $notificationTitle = "Claim Approved";
                $notificationMessage = "Your claim for the $itemName has been approved!";
                $notificationDetails = "Congratulations! Your claim has been approved. Please submit the retrieval form to claim your item. Remember to bring your ID and reference your claim ID #$id when you come to pick it up.";
                $notificationType = "success";
            } else {
                // Claim was denied
                $notificationTitle = "Claim Denied";
                $notificationMessage = "Your claim for the $itemName has been denied.";
                $notificationDetails = "We're sorry, but your claim has been denied.";
                
                if ($reason) {
                    $notificationDetails .= " Reason: $reason";
                }
                
                $notificationDetails .= " If you believe this is an error, please contact our office.";
                $notificationType = "warning";
            }
            
            // Try to create a notification, but don't fail if it doesn't work
            $notificationResult = simpleCreateNotification(
                $conn,
                $userId,
                $notificationTitle,
                $notificationMessage,
                $notificationType,
                "/retrieve-form",
                $notificationDetails
            );
            
            if ($notificationResult) {
                error_log("Successfully created notification with ID: $notificationResult");
            } else {
                error_log("Failed to create notification, but continuing with claim process");
            }
        }

        // Commit the transaction
        $conn->commit();

        echo json_encode([
            "success" => true, 
            "message" => "Claim " . ($approved == 1 ? "approved" : "denied") . " successfully"
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        error_log("Error in claim approval process: " . $e->getMessage());
        
        echo json_encode([
            "success" => false, 
            "message" => "Failed to process claim: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}

$conn->close();
?>