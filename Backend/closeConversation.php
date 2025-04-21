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
        if (!isset($data['conversation_id']) || !is_numeric($data['conversation_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid or missing conversation_id"]);
            exit;
        }

        $conversationId = intval($data['conversation_id']);
        error_log("Closing conversation_id=$conversationId by admin user_id=$userId");

        $stmt = $conn->prepare("UPDATE conversations SET status = 'closed' WHERE conversation_id = :conversation_id");
        $stmt->bindParam(':conversation_id', $conversationId, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Conversation closed"]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Conversation not found"]);
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
