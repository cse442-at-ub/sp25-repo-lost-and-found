<?php
// Start session to access user info
session_start();

// Set headers to prevent error output and ensure JSON response
header('Content-Type: application/json');
// Prevent PHP from outputting errors as HTML
ini_set('display_errors', '0');
error_reporting(0);

// Log errors to server log instead
ini_set('log_errors', '1');
error_log("Starting claim submission process");

// Database connection
$host = 'db';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'jxboulwa'; // Replace with appropriate credentials
$password = '50456062'; // Replace with appropriate credentials

try {
    // Establish database connection with error handling
    $conn = new mysqli($host, $username, $password, $dbname);

    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        echo json_encode([
            "success" => false, 
            "message" => "Database connection failed. Please try again later."
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
} catch (Exception $e) {
    error_log("Error connecting to database: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => "Database connection failed. Please try again later."
    ]);
    exit;
}

$userId = $_SESSION['user_id'];

// Ensure this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);
    exit;
}

// Get JSON input from the request body
$inputJSON = file_get_contents('php://input');
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

// Validate required fields
if (!isset($input['item_id']) || !isset($input['claim_type']) || !isset($input['proof_of_ownership'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required claim details"
    ]);
    exit;
}

$itemId = $input['item_id'];
$claimType = $input['claim_type']; // 'found' for a found item
$proofOfOwnership = $input['proof_of_ownership'];
$additionalDetails = $input['additional_details'] ?? '';

try {
    // Check if the user has already submitted a claim for this item
    $checkStmt = $conn->prepare("SELECT id FROM claims WHERE user_id = ? AND item_id = ? AND claim_type = ? AND approved IS NULL");
    $checkStmt->bind_param("iis", $userId, $itemId, $claimType);
    $checkStmt->execute();
    $existingResult = $checkStmt->get_result();
    
    if ($existingResult->num_rows > 0) {
        echo json_encode([
            "success" => false,
            "message" => "You have already claimed this item"
        ]);
        exit;
    }
    
    // Check if the item exists
    $itemStmt = $conn->prepare("SELECT id, item_name FROM found_items WHERE id = ?");
    $itemStmt->bind_param("i", $itemId);
    $itemStmt->execute();
    $itemResult = $itemStmt->get_result();
    
    if ($itemResult->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "Item not found"
        ]);
        exit;
    }
    
    $itemData = $itemResult->fetch_assoc();
    $itemName = $itemData['item_name'];
    
    // Start transaction
    $conn->begin_transaction();
    
    // Insert the claim
    $stmt = $conn->prepare("INSERT INTO claims (user_id, item_id, claim_type, proof_of_ownership, additional_details) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("iisss", $userId, $itemId, $claimType, $proofOfOwnership, $additionalDetails);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to submit claim: " . $stmt->error);
    }
    
    $claimId = $stmt->insert_id;
    
    // Create notification for the user
    $notificationTitle = "Claim Submitted";
    $notificationMessage = "Your claim for the $itemName has been submitted and is awaiting review.";
    $notificationDetails = "Your claim (ID: $claimId) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.";
    
    // Only create notification if the function exists (file was loaded successfully)
    if (function_exists('createNotification')) {
        try {
            $notificationResult = createNotification(
                $userId,
                $notificationTitle,
                $notificationMessage,
                'info',
                null,
                $notificationDetails
            );
            
            if (!$notificationResult) {
                error_log("Failed to create notification for claim $claimId");
            }
        } catch (Exception $notificationError) {
            error_log("Error creating notification: " . $notificationError->getMessage());
            // Don't fail the whole operation just because notification failed
        }
    } else {
        error_log("createNotification function not available");
    }
    
    // Also notify admins (if you have a way to identify admin users)
    // This would require a function to get all admin user IDs
    // Alternatively, you could create a special admin notification in the database
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Claim submitted successfully",
        "claim_id" => $claimId
    ]);
    
} catch (Exception $e) {
    // Rollback on error
    if ($conn && !$conn->connect_error) {
        $conn->rollback();
    }
    
    error_log("Error in claim submission: " . $e->getMessage());
    error_log("Error trace: " . $e->getTraceAsString());
    
    echo json_encode([
        "success" => false,
        "message" => "Error submitting claim. Please try again later."
    ]);
} finally {
    // Close all statement and connection resources
    if (isset($stmt) && $stmt) $stmt->close();
    if (isset($checkStmt) && $checkStmt) $checkStmt->close();
    if (isset($itemStmt) && $itemStmt) $itemStmt->close();
    if (isset($conn) && $conn) $conn->close();
    
    error_log("Claim submission process completed");
}
?>