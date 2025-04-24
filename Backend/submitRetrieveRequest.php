<?php
/**
 * submitRetrieveRequest.php - Handles the submission of item retrieval requests
 * 
 * This file processes retrieval request submissions from the frontend and stores
 * them in the database. It validates required fields and ensures the user is
 * authorized to retrieve the selected item.
 */

// Start session to access user info
session_start();
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'blaketur'; // Update with appropriate credentials
$password = '50519587'; // Update with appropriate credentials

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode([
        "success" => false, 
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false, 
        "message" => "User not logged in"
    ]);
    exit;
}

$userId = $_SESSION['user_id'];

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['foundItemId']) || !$data['foundItemId']) {
    echo json_encode([
        "success" => false,
        "message" => "No item has been selected for retrieval"
    ]);
    exit;
}

if (!isset($data['name']) || !isset($data['email'])) {
    echo json_encode([
        "success" => false,
        "message" => "Name and email are required"
    ]);
    exit;
}

$foundItemId = $data['foundItemId'];
$name = $data['name'];
$email = $data['email'];
$deliveryMethod = $data['deliveryMethod'] ?? 'pickup';
$preferredTime = $data['preferredTime'] ?? null;
$additionalInstructions = $data['additionalInstructions'] ?? '';
$pickupLocation = $data['pickupLocation'] ?? '';
$address = $data['address'] ?? '';
$county = $data['county'] ?? '';
$state = $data['state'] ?? '';
$zipcode = $data['zipcode'] ?? '';

// Validate that this item is available for this user to retrieve
// (It should be matched with one of their lost items)
try {
    $sql = "
        SELECT 1
        FROM found_items f
        INNER JOIN matches m ON f.id = m.found_item_id
        INNER JOIN lost_items l ON m.lost_item_id = l.id
        WHERE f.id = ? AND l.user_id = ?
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $foundItemId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "You are not authorized to retrieve this item"
        ]);
        exit;
    }
    
    // Check if this item already has a pending retrieval request
    $checkSql = "
        SELECT 1 FROM retrieve_requests 
        WHERE found_item_id = ? AND status = 'pending'
    ";
    
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $foundItemId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        echo json_encode([
            "success" => false,
            "message" => "There is already a pending retrieval request for this item"
        ]);
        exit;
    }
    
    // All validation checks passed, insert the retrieval request
    // First check if the table has an auto-increment ID field
    $describeTable = $conn->prepare("DESCRIBE retrieve_requests");
    $describeTable->execute();
    $tableFields = $describeTable->get_result();
    $hasAutoIncrementId = false;
    
    while ($field = $tableFields->fetch_assoc()) {
        if ($field['Field'] === 'id' && $field['Extra'] === 'auto_increment') {
            $hasAutoIncrementId = true;
            break;
        }
    }
    
    // Create the appropriate SQL statement based on table structure
    if ($hasAutoIncrementId) {
        $insertSql = "
            INSERT INTO retrieve_requests (
                user_id, 
                found_item_id, 
                name, 
                email, 
                delivery_method, 
                preferred_time, 
                additional_instructions, 
                pickup_location, 
                address, 
                county, 
                state, 
                zipcode, 
                status, 
                submitted_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW()
            )
        ";
    } else {
        // Get the next available ID value
        $getMaxIdSql = "SELECT MAX(id) as max_id FROM retrieve_requests";
        $maxIdStmt = $conn->prepare($getMaxIdSql);
        $maxIdStmt->execute();
        $maxIdResult = $maxIdStmt->get_result();
        $maxIdRow = $maxIdResult->fetch_assoc();
        $nextId = ($maxIdRow['max_id'] ?? 0) + 1;
        
        $insertSql = "
            INSERT INTO retrieve_requests (
                id,
                user_id, 
                found_item_id, 
                name, 
                email, 
                delivery_method, 
                preferred_time, 
                additional_instructions, 
                pickup_location, 
                address, 
                county, 
                state, 
                zipcode, 
                status, 
                submitted_at
            ) VALUES (
                $nextId, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW()
            )
        ";
    }
    
    $insertStmt = $conn->prepare($insertSql);
    $insertStmt->bind_param(
        "iissssssssss", 
        $userId, 
        $foundItemId, 
        $name, 
        $email, 
        $deliveryMethod, 
        $preferredTime, 
        $additionalInstructions, 
        $pickupLocation, 
        $address, 
        $county, 
        $state, 
        $zipcode
    );
    
    if ($insertStmt->execute()) {
        // Get the item name for notification purposes
        $getItemNameSql = "SELECT item_name FROM found_items WHERE id = ?";
        $nameStmt = $conn->prepare($getItemNameSql);
        $nameStmt->bind_param("i", $foundItemId);
        $nameStmt->execute();
        $nameResult = $nameStmt->get_result();
        $itemName = "Item";
        
        if ($row = $nameResult->fetch_assoc()) {
            $itemName = $row['item_name'];
        }
        
        // Create notification for admin
        if (function_exists('createNotification')) {
            // If notification helper exists, use it
            require_once 'notification_helper.php';
            
            // Get admin users
            $adminSql = "SELECT user_id FROM users WHERE is_admin = 1";
            $adminStmt = $conn->prepare($adminSql);
            $adminStmt->execute();
            $adminResult = $adminStmt->get_result();
            
            while ($admin = $adminResult->fetch_assoc()) {
                createNotification(
                    $admin['user_id'],
                    'New Retrieval Request',
                    "A new request to retrieve $itemName has been submitted",
                    'info',
                    '/admin-retrieve',
                    "User #$userId has submitted a request to retrieve item #$foundItemId ($itemName). Please review and update the status."
                );
            }
            
            // Also notify the user
            createNotification(
                $userId,
                'Retrieval Request Submitted',
                "Your request to retrieve $itemName has been submitted successfully",
                'success',
                null,
                "Your request to retrieve $itemName has been submitted and is pending approval. We'll notify you when the status changes."
            );
        }
        
        echo json_encode([
            "success" => true,
            "message" => "Your retrieval request has been submitted successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to submit retrieval request: " . $insertStmt->error
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error processing retrieval request: " . $e->getMessage()
    ]);
} finally {
    $conn->close();
}