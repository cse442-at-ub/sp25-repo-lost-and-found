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
        echo json_encode(["error" => "Missing required parameters"]);
        exit;
    }

    $id = intval($input['id']); // Ensure ID is an integer
    $approved = $input['approved']; // Can be null, 0, or 1

    // Start transaction
    $conn->begin_transaction();

    try {
        // Prepare and execute query to update claim
        $stmt = $conn->prepare("UPDATE claims SET approved = ? WHERE id = ?");
        $stmt->bind_param("si", $approved, $id); 

        if (!$stmt->execute()) {
            throw new Exception("Failed to update claim");
        }

        // If we successfully updated the claim, get claim details for notification
        $claimDetailsQuery = $conn->prepare("
            SELECT 
                c.user_id,
                c.claim_type,
                c.item_id,
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
            
            // Send appropriate notification based on approval status
            if ($approved == 1) {
                // Claim was approved
                notifyClaimApproved($userId, $itemName, $id);
            } elseif ($approved == 0) {
                // Claim was denied
                notifyClaimDenied($userId, $itemName, $id);
            }
        }

        // Commit the transaction
        $conn->commit();

        echo json_encode(["success" => true, "message" => "Claim updated successfully"]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        echo json_encode(["error" => $e->getMessage()]);
    } finally {
        if (isset($stmt)) {
            $stmt->close();
        }
        if (isset($claimDetailsQuery)) {
            $claimDetailsQuery->close();
        }
    }
} else {
    echo json_encode(["error" => "Invalid request method"]);
}

$conn->close();
?>