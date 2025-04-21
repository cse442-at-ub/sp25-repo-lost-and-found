<?php
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

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
require_once 'db.php';

// Log session data for debugging
error_log("Session data: " . json_encode($_SESSION));

if (!isset($_SESSION['user_id'])) {
    error_log("User not logged in");
    http_response_code(401);
    echo json_encode(["error" => "User not logged in"]);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    $conn = getDbConnection();
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            if (!isset($_GET['item_id']) || !isset($_GET['item_type'])) {
                http_response_code(400);
                echo json_encode(["error" => "Missing item_id or item_type"]);
                exit;
            }

            $itemId = intval($_GET['item_id']);
            $itemType = $_GET['item_type'];

            error_log("GET: item_id=$itemId, item_type=$itemType, user_id=$userId");

            $stmt = $conn->prepare("SELECT conversation_id, status FROM conversations WHERE item_id = :item_id AND item_type = :item_type");
            $stmt->bindParam(':item_id', $itemId, PDO::PARAM_INT);
            $stmt->bindParam(':item_type', $itemType, PDO::PARAM_STR);
            if (!$stmt->execute()) {
                throw new Exception("Failed to fetch conversation: " . implode(", ", $stmt->errorInfo()));
            }

            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$result) {
                error_log("Creating new conversation for item_id=$itemId");
                $stmt = $conn->prepare("INSERT INTO conversations (item_id, item_type) VALUES (:item_id, :item_type)");
                $stmt->bindParam(':item_id', $itemId, PDO::PARAM_INT);
                $stmt->bindParam(':item_type', $itemType, PDO::PARAM_STR);
                if (!$stmt->execute()) {
                    throw new Exception("Failed to create conversation: " . implode(", ", $stmt->errorInfo()));
                }
                $conversationId = $conn->lastInsertId();

                echo json_encode([
                    "success" => true,
                    "conversation_id" => $conversationId,
                    "status" => "open",
                    "messages" => []
                ]);
                exit;
            }

            $conversationId = $result['conversation_id'];
            $conversationStatus = $result['status'];
            $stmt = $conn->prepare("
                SELECT cm.*, u.first_name, u.last_name 
                FROM chat_messages cm 
                JOIN users u ON cm.user_id = u.user_id 
                WHERE cm.conversation_id = :conversation_id 
                ORDER BY cm.created_at ASC
            ");
            $stmt->bindParam(':conversation_id', $conversationId, PDO::PARAM_INT);
            if (!$stmt->execute()) {
                throw new Exception("Failed to fetch messages: " . implode(", ", $stmt->errorInfo()));
            }

            $messages = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $messages[] = [
                    'message_id' => $row['message_id'],
                    'user_id' => $row['user_id'],
                    'user_name' => $row['first_name'] . ' ' . $row['last_name'],
                    'message' => $row['message'],
                    'created_at' => $row['created_at']
                ];
            }

            error_log("Fetched " . count($messages) . " messages for conversation_id=$conversationId");
            echo json_encode([
                "success" => true,
                "conversation_id" => $conversationId,
                "status" => $conversationStatus,
                "messages" => $messages
            ]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['conversation_id']) || !is_numeric($data['conversation_id']) || !isset($data['message']) || empty(trim($data['message']))) {
                http_response_code(400);
                echo json_encode(["error" => "Missing or invalid conversation_id or message"]);
                exit;
            }

            $conversationId = intval($data['conversation_id']);
            $message = trim($data['message']);

            // Verify conversation_id exists and is open
            $stmt = $conn->prepare("SELECT conversation_id, status FROM conversations WHERE conversation_id = :conversation_id");
            $stmt->bindParam(':conversation_id', $conversationId, PDO::PARAM_INT);
            if (!$stmt->execute()) {
                throw new Exception("Failed to verify conversation: " . implode(", ", $stmt->errorInfo()));
            }
            $conversation = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$conversation) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid conversation_id"]);
                exit;
            }
            if ($conversation['status'] === 'closed') {
                http_response_code(403);
                echo json_encode(["error" => "This conversation is closed"]);
                exit;
            }

            error_log("POST: conversation_id=$conversationId, message=$message, user_id=$userId");
            // to_user_id is nullable in the schema; omitted from INSERT as it's not required
            $stmt = $conn->prepare("
                INSERT INTO chat_messages (conversation_id, user_id, message, created_at) 
                VALUES (:conversation_id, :user_id, :message, NOW())
            ");
            $stmt->bindParam(':conversation_id', $conversationId, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':message', $message, PDO::PARAM_STR);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to insert message: " . implode(", ", $stmt->errorInfo()));
            }

            $messageId = $conn->lastInsertId();
            error_log("Message sent, message_id=$messageId");
            echo json_encode([
                "success" => true,
                "message_id" => $messageId
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Invalid request method"]);
            break;
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