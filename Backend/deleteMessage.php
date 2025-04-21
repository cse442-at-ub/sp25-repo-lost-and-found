<?php
//this file is used to delete a message from the chat 


error_reporting(E_ALL);
ini_set('display_errors', 1);

$allowedOrigins = [
    //'http://localhost:5173',
    'https://cattle.cse.buffalo.edu/CSE442/2025-Spring/cse-442s'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: http://localhost:5173');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    error_log("User not logged in");
    echo json_encode(["error" => "User not logged in"]);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    $conn = getDbConnection();
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Check if user is admin
    $stmt = $conn->prepare("SELECT is_admin FROM users WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user || !$user['is_admin']) {
        http_response_code(403);
        echo json_encode(["error" => "Unauthorized: Admin access required"]);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['message_id']) || !is_numeric($data['message_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing message_id"]);
        exit;
    }

    $messageId = intval($data['message_id']);
    error_log("Deleting message_id=$messageId by admin user_id=$userId");

    // Get the conversation_id for the message
    $stmt = $conn->prepare("SELECT conversation_id FROM chat_messages WHERE message_id = :message_id");
    $stmt->bindParam(':message_id', $messageId, PDO::PARAM_INT);
    $stmt->execute();
    $message = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$message) {
        http_response_code(404);
        echo json_encode(["error" => "Message not found"]);
        exit;
    }
    $conversationId = $message['conversation_id'];

    // Delete the message
    $stmt = $conn->prepare("DELETE FROM chat_messages WHERE message_id = :message_id");
    $stmt->bindParam(':message_id', $messageId, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        // Check if there are any remaining messages in the conversation
        $stmt = $conn->prepare("SELECT COUNT(*) FROM chat_messages WHERE conversation_id = :conversation_id");
        $stmt->bindParam(':conversation_id', $conversationId, PDO::PARAM_INT);
        $stmt->execute();
        $remainingMessages = $stmt->fetchColumn();

        if ($remainingMessages == 0) {
            // If no messages remain, close the conversation
            $stmt = $conn->prepare("UPDATE conversations SET status = 'closed' WHERE conversation_id = :conversation_id");
            $stmt->bindParam(':conversation_id', $conversationId, PDO::PARAM_INT);
            $stmt->execute();
            error_log("Closed conversation_id=$conversationId as no messages remain");
        }

        echo json_encode(["success" => true, "message" => "Message deleted"]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Message not found"]);
    }
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        "error" => "Server error",
        "details" => $e->getMessage()
    ]);
} finally {
    $conn = null;
}
?>
