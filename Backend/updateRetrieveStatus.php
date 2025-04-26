<?php
// Start session to verify admin status
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'User not authenticated']);
    exit();
}

// Check if user is admin (using the is_admin cookie)
if (!isset($_COOKIE['is_admin']) || $_COOKIE['is_admin'] !== 'true') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Admin access required']);
    exit();
}

header('Content-Type: application/json');

// Get the request data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields'
    ]);
    exit;
}

// Validate status
$allowedStatuses = ['pending', 'ready for pickup', 'sent via mail'];
if (!in_array($data['status'], $allowedStatuses)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid status value'
    ]);
    exit;
}

// Database connection
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'dinalben'; // Replace with your username
$password = '50409149'; // Replace with your password

try {
    $conn = new mysqli($host, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
    // Begin transaction
    $conn->begin_transaction();
    
    // Get the retrieval request details before update
    $selectStmt = $conn->prepare("
        SELECT rr.*, u.user_id, fi.item_name 
        FROM retrieve_requests rr
        JOIN users u ON rr.user_id = u.user_id
        JOIN found_items fi ON rr.found_item_id = fi.id
        WHERE rr.id = ?
    ");
    
    if (!$selectStmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $selectStmt->bind_param("i", $data['id']);
    $selectStmt->execute();
    $result = $selectStmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Retrieval request not found");
    }
    
    $requestDetails = $result->fetch_assoc();
    $currentStatus = $requestDetails['status'] ?? 'pending';
    
    // Update the status
    $updateStmt = $conn->prepare("UPDATE retrieve_requests SET status = ? WHERE id = ?");
    
    if (!$updateStmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $updateStmt->bind_param("si", $data['status'], $data['id']);
    
    if (!$updateStmt->execute()) {
        throw new Exception("Execute failed: " . $updateStmt->error);
    }
    
    // If status is being changed, create a notification for the user
    if ($currentStatus !== $data['status']) {
        try {
            // Create notification message based on new status
            $notificationTitle = "Retrieval Request Update";
            $notificationMessage = "Your retrieval request for " . $requestDetails['item_name'] . " has been updated.";
            $notificationType = "info";
            
            switch ($data['status']) {
                case 'ready for pickup':
                    $notificationMessage = "Your item is ready for pickup at " . $requestDetails['pickup_location'] . ".";
                    $notificationType = "success";
                    $notificationDetails = "Please bring your ID when you come to pick up your item. Your preferred pickup time was noted as " . 
                        ($requestDetails['preferred_time'] ? date('g:i a', strtotime($requestDetails['preferred_time'])) : "not specified") . ".";
                    break;
                    
                case 'sent via mail':
                    $notificationMessage = "Your item has been sent to your shipping address.";
                    $notificationType = "success";
                    $notificationDetails = "Your item has been shipped to the address you provided. Please allow 3-5 business days for delivery.";
                    break;
                    
                default:
                    $notificationMessage = "The status of your retrieval request has been updated to: " . $data['status'];
                    $notificationDetails = "Please check your request status for more information.";
            }
            
            // Check if notification_system table exists
            $tableCheckResult = $conn->query("SHOW TABLES LIKE 'notification_system'");
            if ($tableCheckResult->num_rows > 0) {
                // Insert notification for the user
                $notifyStmt = $conn->prepare("
                    INSERT INTO notification_system (user_id, title, message, type, details)
                    VALUES (?, ?, ?, ?, ?)
                ");
                
                if (!$notifyStmt) {
                    throw new Exception("Prepare failed: " . $conn->error);
                }
                
                $notifyStmt->bind_param(
                    "issss",
                    $requestDetails['user_id'],
                    $notificationTitle,
                    $notificationMessage,
                    $notificationType,
                    $notificationDetails
                );
                
                $notifyStmt->execute();
            }
        } catch (Exception $e) {
            // Log but continue
            error_log("Failed to create notification: " . $e->getMessage());
        }
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Status updated successfully'
    ]);
    
} catch (Exception $e) {
    // Rollback on error
    if (isset($conn) && $conn->connect_errno === 0) {
        $conn->rollback();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
    
    // Log the error
    error_log("Error in updateRetrieveStatus.php: " . $e->getMessage());
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>