<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$allowedOrigins = [
   // 'http://localhost:5173',
    'https://cattle.cse.buffalo.edu/CSE442/2025-Spring/cse-442s'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: http://localhost:5173');
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
require_once 'db.php';

try {
    $conn = getDbConnection();
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Fetch distinct conversations with item_id, initiating user, and last message details
    // Only include conversations with status = 'open'
    $stmt = $conn->prepare("
        SELECT DISTINCT c.item_id, 
               u.user_id AS initiating_user_id, 
               CONCAT(u.first_name, ' ', u.last_name) AS initiating_user_name,
               (SELECT cm.user_id 
                FROM chat_messages cm 
                WHERE cm.conversation_id = c.conversation_id 
                ORDER BY cm.created_at DESC 
                LIMIT 1) AS last_message_sender_id,
               (SELECT cm.created_at 
                FROM chat_messages cm 
                WHERE cm.conversation_id = c.conversation_id 
                ORDER BY cm.created_at DESC 
                LIMIT 1) AS last_message_timestamp
        FROM conversations c
        JOIN chat_messages cm ON c.conversation_id = cm.conversation_id
        JOIN users u ON cm.user_id = u.user_id
        WHERE c.item_type = 'found' AND c.status = 'open'
        ORDER BY last_message_timestamp DESC
    ");
    $stmt->execute();
    $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process conversations to determine if a user is waiting for a response
    $activeConversations = [];
    foreach ($conversations as $conv) {
        $isWaiting = false;
        if ($conv['last_message_sender_id']) {
            // Check if the last message sender is not an admin
            $stmt = $conn->prepare("SELECT is_admin FROM users WHERE user_id = :user_id");
            $stmt->bindParam(':user_id', $conv['last_message_sender_id'], PDO::PARAM_INT);
            $stmt->execute();
            $sender = $stmt->fetch(PDO::FETCH_ASSOC);
            $isWaiting = $sender && !$sender['is_admin']; // User is waiting if last message was from a non-admin
        }

        $activeConversations[] = [
            'item_id' => $conv['item_id'],
            'initiating_user_id' => $conv['initiating_user_id'],
            'initiating_user_name' => $conv['initiating_user_name'],
            'last_message_timestamp' => $conv['last_message_timestamp'],
            'is_waiting' => $isWaiting
        ];
    }

    echo json_encode(["success" => true, "conversations" => $activeConversations]);
} catch (Exception $e) {
    error_log("Error in activeConversations: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
    echo json_encode(["success" => false, "error" => "Server error", "details" => $e->getMessage()]);
} finally {
    $conn = null;
}
?>
