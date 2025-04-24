<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight requests for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'dinalben';
$password = '50409149';

try {
    $conn = new mysqli($host, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    exit;
}

// Start the session
session_start();
$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'User not authenticated']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data from the request body
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Log incoming data for debugging
    error_log("Received data: " . print_r($data, true));

    // Validate required fields
    if (!isset($data['name'], $data['email'], $data['delivery_method'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields.']);
        exit;
    }

    // Check for found item ID
    $foundItemId = $data['found_item_id'] ?? null;
    if (!$foundItemId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No found item specified for retrieval.']);
        exit;
    }

    // Extract and sanitize all fields
    $name = $conn->real_escape_string(trim($data['name']));
    $email = $conn->real_escape_string(trim($data['email']));
    $deliveryMethod = $conn->real_escape_string($data['delivery_method']);
    $preferredTime = isset($data['preferred_time']) ? $conn->real_escape_string($data['preferred_time']) : null;
    $additionalInstructions = isset($data['additional_instructions']) ? $conn->real_escape_string($data['additional_instructions']) : '';
    $pickupLocation = isset($data['pickup_location']) ? $conn->real_escape_string($data['pickup_location']) : '';
    $address = isset($data['address']) ? $conn->real_escape_string($data['address']) : '';
    $county = isset($data['county']) ? $conn->real_escape_string($data['county']) : '';
    $state = isset($data['state']) ? $conn->real_escape_string($data['state']) : '';
    $zipcode = isset($data['zipcode']) ? $conn->real_escape_string($data['zipcode']) : '';

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid email format.']);
        exit;
    }

    // Validate appropriate fields are set based on delivery method
    if ($deliveryMethod === 'pickup' && empty($pickupLocation)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Pickup location is required for in-person pickup.']);
        exit;
    } elseif ($deliveryMethod === 'shipping' && (empty($address) || empty($county) || empty($state) || empty($zipcode))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Complete shipping address is required for mail delivery.']);
        exit;
    }

    try {
        // Check if item exists and is available
        $checkStmt = $conn->prepare("SELECT id FROM found_items WHERE id = ?");
        $checkStmt->bind_param("i", $foundItemId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'The specified item was not found.']);
            exit;
        }
        
        // Begin transaction
        $conn->begin_transaction();
        
        // Prepare the SQL statement based on the current DB structure
        $sql = "INSERT INTO retrieve_requests (
            user_id, found_item_id, name, email, delivery_method, preferred_time,
            additional_instructions, pickup_location, address,
            county, state, zipcode, submitted_at, status
        ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, NOW(), 'pending'
        )";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param(
            "iisssssssss", 
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
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        // Get the new request ID
        $requestId = $conn->insert_id;

        // Create notification for admin users if notification table exists
        try {
            // Check if notification_system table exists
            $tableCheckResult = $conn->query("SHOW TABLES LIKE 'notification_system'");
            if ($tableCheckResult->num_rows > 0) {
                // Get admin user IDs
                $adminResult = $conn->query("SELECT user_id FROM users WHERE is_admin = 1");
                
                // Prepare notification details
                $notifyTitle = 'New Retrieval Request';
                $notifyMessage = "User $name has submitted a retrieval request for an item.";
                $notifyType = 'info';
                $notifyLink = '/admin-retrieve';
                $notifyDetails = "A new retrieval request (#$requestId) has been submitted. Please review it in the Admin Retrieve section.";
                
                // Send notification to each admin
                while ($adminRow = $adminResult->fetch_assoc()) {
                    $adminId = $adminRow['user_id'];
                    
                    $notifyStmt = $conn->prepare("
                        INSERT INTO notification_system (
                            user_id, title, message, type, link, details
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?
                        )
                    ");
                    
                    $notifyStmt->bind_param(
                        "isssss",
                        $adminId,
                        $notifyTitle,
                        $notifyMessage,
                        $notifyType,
                        $notifyLink,
                        $notifyDetails
                    );
                    
                    $notifyStmt->execute();
                }
            }
        } catch (Exception $e) {
            // Log notification error but continue with the request
            error_log("Failed to create admin notification: " . $e->getMessage());
        }

        // Commit transaction
        $conn->commit();

        // Return success response
        echo json_encode([
            'success' => true, 
            'message' => 'Retrieval request submitted successfully',
            'request_id' => $requestId
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'error' => 'Failed to save request: ' . $e->getMessage()
        ]);
        
        // Log the error
        error_log("Database error in retrieve.php: " . $e->getMessage());
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}

// Close the database connection
$conn->close();