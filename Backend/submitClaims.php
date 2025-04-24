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

// Include database connection
require_once 'db.php';

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
    $pdo = getDbConnection();
    
    // Check if the user has already submitted a claim for this item
    $checkStmt = $pdo->prepare("SELECT id FROM claims WHERE user_id = ? AND item_id = ? AND claim_type = ? AND approved IS NULL");
    $checkStmt->execute([$userId, $itemId, $claimType]);
    
    if ($checkStmt->rowCount() > 0) {
        echo json_encode([
            "success" => false,
            "message" => "You have already claimed this item"
        ]);
        exit;
    }
    
    // Check if the item exists
    $itemStmt = $pdo->prepare("SELECT id, item_name FROM found_items WHERE id = ?");
    $itemStmt->execute([$itemId]);
    
    if ($itemStmt->rowCount() === 0) {
        echo json_encode([
            "success" => false,
            "message" => "Item not found"
        ]);
        exit;
    }
    
    $itemData = $itemStmt->fetch(PDO::FETCH_ASSOC);
    $itemName = $itemData['item_name'];
    
    // Start transaction
    $pdo->beginTransaction();
    
    // Insert the claim
    $stmt = $pdo->prepare("INSERT INTO claims (user_id, item_id, claim_type, proof_of_ownership, additional_details) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $itemId, $claimType, $proofOfOwnership, $additionalDetails]);
    
    $claimId = $pdo->lastInsertId();
    
    // Create notification for the user
    $notificationTitle = "Claim Submitted";
    $notificationMessage = "Your claim for the $itemName has been submitted and is awaiting review.";
    $notificationDetails = "Your claim (ID: $claimId) has been received and will be reviewed by our administrators. You will be notified when your claim is approved or denied.";
    
    // Handle notification creation - first check if the function exists
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
            
            // Also notify admins about the new claim
            $notifyAdminTitle = "New claim for $itemName";
            $notifyAdminMessage = "A claim (ID: $claimId) from user ($userId) has been received. Please review it.";
            $notifyAdminDetails = "A claim (ID: $claimId) from user ($userId) has been received. Please review it.";
            
            $adminStmt = $pdo->query('SELECT user_id FROM users WHERE is_admin=1');
            while ($row = $adminStmt->fetch(PDO::FETCH_ASSOC)) {
                $adminId = $row['user_id'];
                createNotification(
                    $adminId,
                    $notifyAdminTitle,
                    $notifyAdminMessage,
                    'info',
                    null,
                    $notifyAdminDetails
                );
            }
        } catch (Exception $notificationError) {
            error_log("Error creating notification: " . $notificationError->getMessage());
            // Don't fail the whole operation just because notification failed
        }
    } else {
        error_log("createNotification function not available");
        
        // Try to directly insert notification if the function isn't available
        try {
            // Insert notification for the claimant
            $notifStmt = $pdo->prepare("INSERT INTO notification_system (user_id, title, message, details, type) VALUES (?, ?, ?, ?, ?)");
            $type = 'info';
            $notifStmt->execute([$userId, $notificationTitle, $notificationMessage, $notificationDetails, $type]);
            
            // Notify admins
            $notifyAdminTitle = "New claim for $itemName";
            $notifyAdminMessage = "A claim (ID: $claimId) from user ($userId) has been received. Please review it.";
            $notifyAdminDetails = "A claim (ID: $claimId) from user ($userId) has been received. Please review it.";
            
            $adminStmt = $pdo->query('SELECT user_id FROM users WHERE is_admin=1');
            while ($row = $adminStmt->fetch(PDO::FETCH_ASSOC)) {
                $adminId = $row['user_id'];
                $notifStmt->execute([$adminId, $notifyAdminTitle, $notifyAdminMessage, $notifyAdminDetails, $type]);
            }
        } catch (Exception $directNotifError) {
            error_log("Error creating direct notification: " . $directNotifError->getMessage());
        }
    }
    
    // Commit transaction
    $pdo->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Claim submitted successfully",
        "claim_id" => $claimId
    ]);
    
} catch (PDOException $e) {
    // Rollback on error
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Error in claim submission: " . $e->getMessage());
    error_log("Error trace: " . $e->getTraceAsString());
    
    echo json_encode([
        "success" => false,
        "message" => "Error submitting claim. Please try again later."
    ]);
} catch (Exception $e) {
    // Rollback on error
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Error in claim submission: " . $e->getMessage());
    error_log("Error trace: " . $e->getTraceAsString());
    
    echo json_encode([
        "success" => false,
        "message" => "Error submitting claim. Please try again later."
    ]);
}
?>