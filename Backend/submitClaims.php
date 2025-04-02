<?php
// Start session to access user info
session_start();
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'blaketur'; // Replace with appropriate credentials
$password = '50519587'; // Replace with appropriate credentials

// Include notification helper for sending updates
require_once 'notification_helper.php';

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

// Ensure this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);
    exit;
}

// Get JSON input from the request body
$input = json_decode(file_get_contents('php://input'), true);

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
    
    createNotification(
        $userId,
        $notificationTitle,
        $notificationMessage,
        'info',
        null,
        $notificationDetails
    );
    
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
    if ($conn->connect_error == false) {
        $conn->rollback();
    }
    
    echo json_encode([
        "success" => false,
        "message" => "Error submitting claim: " . $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($checkStmt)) $checkStmt->close();
    if (isset($itemStmt)) $itemStmt->close();
    $conn->close();
}
?>