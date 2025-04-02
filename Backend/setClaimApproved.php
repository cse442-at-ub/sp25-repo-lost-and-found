<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json');

// Database connection
$host = 'localhost'; // Change as needed
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'blaketur';
$password = '50519587';

// Include the notification helper
require_once 'notification_helper.php';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Check for POST request
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Get input data
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($input['id']) || !isset($input['approved'])) {
        echo json_encode(["error" => "Database connection failed"]);
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
            $stmt->bind_param("isi", $approved, $reason, $id);
        } else {
            // If approving or no reason provided
            $stmt = $conn->prepare("UPDATE claims SET approved = ? WHERE id = ?");
            $stmt->bind_param("ii", $approved, $id); 
        }

        if (!$stmt->execute()) {
            throw new Exception("Failed to update claim");
        }

        // If we successfully updated the claim, get claim details for notification
        $claimDetailsQuery = $conn->prepare("
            SELECT 
                c.user_id,
                c.claim_type,
                c.item_id,
                c.proof_of_ownership,
                c.additional_details,
                CASE 
                    WHEN c.claim_type = 'lost' THEN li.name
                    WHEN c.claim_type = 'found' THEN fi.item_name
                END as item_name
            FROM claims c
            LEFT JOIN lost_items li ON c.claim_type = 'lost' AND c.item_id = li.id
            LEFT JOIN found_items fi ON c.claim_type = 'found' AND c.item_id = fi.id
            WHERE c.id = ?
        ");
        
        $claimDetailsQuery->bind_param("i", $id);
        
        if (!$claimDetailsQuery->execute()) {
            throw new Exception("Failed to get claim details");
        }
        
        $result = $claimDetailsQuery->get_result();
        $claimDetails = $result->fetch_assoc();

        if ($claimDetails) {
            $userId = $claimDetails['user_id'];
            $itemName = $claimDetails['item_name'] ?? 'Item';
            $claimType = $claimDetails['claim_type'];
            $itemId = $claimDetails['item_id'];
            
            // Send appropriate notification based on approval status
            if ($approved == 1) {
                // Claim was approved
                $notificationTitle = "Claim Approved";
                $notificationMessage = "Your claim for the $itemName has been approved!";
                $notificationDetails = "Congratulations! Your claim has been approved. Please visit our office to retrieve your item. Remember to bring your ID and reference your claim ID #$id.";
                $notificationType = "success";
                
                // Create a notification for the user
                createNotification(
                    $userId,
                    $notificationTitle,
                    $notificationMessage,
                    $notificationType,
                    "/claim-details?id=$id",
                    $notificationDetails
                );
                
                // If this is a found item that's been claimed, mark it as matched in the database
                if ($claimType === 'found') {
                    // Check if there's a corresponding lost item report
                    $matchQuery = $conn->prepare("
                        SELECT li.id FROM lost_items li
                        WHERE li.user_id = ? AND 
                        (li.name LIKE ? OR ? LIKE CONCAT('%', li.name, '%'))
                    ");
                    
                    // Using LIKE for fuzzy matching on item name
                    $itemNamePattern = "%" . $itemName . "%";
                    $matchQuery->bind_param("iss", $userId, $itemNamePattern, $itemName);
                    $matchQuery->execute();
                    $matchResult = $matchQuery->get_result();
                    
                    if ($matchResult->num_rows > 0) {
                        // Found a potential match
                        $matchRow = $matchResult->fetch_assoc();
                        $lostItemId = $matchRow['id'];
                        
                        // Insert a match record
                        $insertMatchQuery = $conn->prepare("
                            INSERT INTO matches (lost_item_id, found_item_id)
                            VALUES (?, ?)
                            ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
                        ");
                        $insertMatchQuery->bind_param("ii", $lostItemId, $itemId);
                        $insertMatchQuery->execute();
                    }
                }
            } elseif ($approved == 0) {
                // Claim was denied
                $notificationTitle = "Claim Denied";
                $notificationMessage = "Your claim for the $itemName has been denied.";
                $notificationDetails = "We're sorry, but your claim has been denied.";
                
                if ($reason) {
                    $notificationDetails .= " Reason: $reason";
                }
                
                $notificationDetails .= " If you believe this is an error, please contact our office.";
                $notificationType = "warning";
                
                createNotification(
                    $userId,
                    $notificationTitle,
                    $notificationMessage,
                    $notificationType,
                    "/claim-details?id=$id",
                    $notificationDetails
                );
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
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    } finally {
        if (isset($stmt)) {
            $stmt->close();
        }
        if (isset($claimDetailsQuery)) {
            $claimDetailsQuery->close();
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}

$conn->close();
?>