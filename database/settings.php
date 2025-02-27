<?php
header("Content-Type: application/json");
require_once 'db.php'; // Database connection

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handlePostRequest();
        break;
    case 'GET':
        handleGetRequest();
        break;
    case 'DELETE':
        handleDeleteRequest();
        break;
    default:
        echo json_encode(["error" => "Invalid request method"]);
        http_response_code(405);
        break;
}

function handlePostRequest() {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        echo json_encode(["error" => "Invalid input"]);
        http_response_code(400);
        return;
    }
    
    global $conn;
    $userId = intval($data['user_id']);
    
    // Validate and update user info
    if (isset($data['user_info'])) {
        $userInfo = $data['user_info'];
        $firstName = filter_var($userInfo['firstName'], FILTER_SANITIZE_STRING);
        $lastName = filter_var($userInfo['lastName'], FILTER_SANITIZE_STRING);
        $email = filter_var($userInfo['email'], FILTER_VALIDATE_EMAIL);
        $phone = preg_match("/\(\d{3}\) \d{3}-\d{4}/", $userInfo['phone']) ? $userInfo['phone'] : null;

        if (!$email || !$phone) {
            echo json_encode(["error" => "Invalid email or phone format"]);
            http_response_code(400);
            return;
        }

        $stmt = $conn->prepare("UPDATE users SET first_name=?, last_name=?, email=?, phone=? WHERE id=?");
        $stmt->bind_param("ssssi", $firstName, $lastName, $email, $phone, $userId);
        $stmt->execute();
    }
    
    // Update notification preferences
    if (isset($data['notifications'])) {
        $notifications = $data['notifications'];
        $stmt = $conn->prepare("UPDATE user_notifications SET email=?, sms=?, push=? WHERE user_id=?");
        $stmt->bind_param("iiii", $notifications['email'], $notifications['sms'], $notifications['push'], $userId);
        $stmt->execute();
    }

    echo json_encode(["success" => "User data updated successfully"]);
}

function handleGetRequest() {
    global $conn;
    $userId = intval($_GET['user_id']);
    
    $stmt = $conn->prepare("SELECT first_name, last_name, email, phone FROM users WHERE id=?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $userResult = $stmt->get_result()->fetch_assoc();

    $stmt = $conn->prepare("SELECT email, sms, push FROM user_notifications WHERE user_id=?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $notifications = $stmt->get_result()->fetch_assoc();
    
    echo json_encode(["user_info" => $userResult, "notifications" => $notifications]);
}

function handleDeleteRequest() {
    global $conn;
    $data = json_decode(file_get_contents("php://input"), true);
    $userId = intval($data['user_id']);
    
    if (!isset($data['confirm']) || !$data['confirm']) {
        echo json_encode(["error" => "Account deletion not confirmed"]);
        http_response_code(400);
        return;
    }
    
    // Soft delete: Mark the account as inactive instead of removing it
    $stmt = $conn->prepare("UPDATE users SET is_deleted=1 WHERE id=?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    
    echo json_encode(["success" => "Account deletion request processed"]);
}
?>
