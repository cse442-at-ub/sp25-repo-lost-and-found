<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type: application/json');
require_once 'db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "User not logged in"]);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    $conn = getDbConnection();
    if (!$conn) {
        throw new Exception("Failed to connect to database");
    }

    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get conversation for a specific item
            if (isset($_GET['item_id']) && isset($_GET['item_type'])) {
                $itemId = intval($_GET['item_id']);
                $itemType = $_GET['item_type'];
                
                // Get or create conversation
                $stmt = $conn->prepare("
                    SELECT conversation_id 
                    FROM conversations 
                    WHERE item_id = :item_id AND item_type = :item_type
                ");
                if (!$stmt) {
                    throw new Exception("Prepare failed: " . implode(", ", $conn->errorInfo()));
                }
                
                $stmt->bindParam(':item_id', $itemId, PDO::PARAM_INT);
                $stmt->bindParam(':item_type', $itemType, PDO::PARAM_STR);
                
                if (!$stmt->execute()) {
                    throw new Exception("Execute failed: " . implode(", ", $stmt->errorInfo()));
                }
                
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$result) {
                    // Create new conversation
                    $stmt = $conn->prepare("
                        INSERT INTO conversations (item_id, item_type) 
                        VALUES (:item_id, :item_type)
                    ");
                    if (!$stmt) {
                        throw new Exception("Prepare failed: " . implode(", ", $conn->errorInfo()));
                    }
                    
                    $stmt->bindParam(':item_id', $itemId, PDO::PARAM_INT);
                    $stmt->bindParam(':item_type', $itemType, PDO::PARAM_STR);
                    
                    if (!$stmt->execute()) {
                        throw new Exception("Execute failed: " . implode(", ", $stmt->errorInfo()));
                    }
                    
                    $conversationId = $conn->lastInsertId();
                    
                    // Return empty messages array for new conversation
                    echo json_encode([
                        "success" => true,
                        "conversation_id" => $conversationId,
                        "messages" => []
                    ]);
                    exit;
                } else {
                    $conversationId = $result['conversation_id'];
                }
                
                // Get messages for this conversation
                $stmt = $conn->prepare("
                    SELECT chat_messages.*, users.first_name, users.last_name 
                    FROM chat_messages 
                    JOIN users ON chat_messages.user_id = users.user_id 
                    WHERE chat_messages.conversation_id = :conversation_id 
                    ORDER BY chat_messages.created_at ASC
                ");
                if (!$stmt) {
                    throw new Exception("Prepare failed: " . implode(", ", $conn->errorInfo()));
                }
                
                $stmt->bindParam(':conversation_id', $conversationId, PDO::PARAM_INT);
                
                if (!$stmt->execute()) {
                    throw new Exception("Execute failed: " . implode(", ", $stmt->errorInfo()));
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
                
                echo json_encode([
                    "success" => true,
                    "conversation_id" => $conversationId,
                    "messages" => $messages
                ]);
            } else {
                echo json_encode(["error" => "Missing required parameters: item_id and item_type"]);
            }
            break;
            
        case 'POST':
            // Send a new message
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['conversation_id']) || !isset($data['message'])) {
                echo json_encode(["error" => "Missing required parameters: conversation_id and message"]);
                exit;
            }
            
            $conversationId = intval($data['conversation_id']);
            $message = $data['message'];
            
            $stmt = $conn->prepare("
                INSERT INTO chat_messages (conversation_id, user_id, message) 
                VALUES (:conversation_id, :user_id, :message)
            ");
            if (!$stmt) {
                throw new Exception("Prepare failed: " . implode(", ", $conn->errorInfo()));
            }
            
            $stmt->bindParam(':conversation_id', $conversationId, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':message', $message, PDO::PARAM_STR);
            
            if (!$stmt->execute()) {
                throw new Exception("Execute failed: " . implode(", ", $stmt->errorInfo()));
            }
            
            echo json_encode([
                "success" => true,
                "message_id" => $conn->lastInsertId()
            ]);
            break;
            
        default:
            echo json_encode(["error" => "Invalid request method: " . $method]);
            break;
    }
} catch (Exception $e) {
    error_log("Chat API Error: " . $e->getMessage());
    echo json_encode([
        "error" => "Database error",
        "details" => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn = null; // Close PDO connection
    }
}
?>
