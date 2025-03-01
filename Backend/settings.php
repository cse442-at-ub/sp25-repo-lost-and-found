<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("HTTP/1.1 204 No Content"); // Respond with 204 (No Content) instead of 200
    http_response_code(200);
    exit();
}

require_once 'config.php'; // Database connection m

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
    global $conn;

    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    if (!isset($data['data']) || !isset($_GET['user_id']) || !isset($data['type'])) {
        echo json_encode(["error" => "Invalid input", "received" => $data]);
        http_response_code(400);
        return;
    }

    $userId = intval($_GET['user_id']);

    if ($data['type'] === "userInfo") {
        $userInfo = $data['data'];
        $firstName = filter_var($userInfo['firstName'], FILTER_SANITIZE_SPECIAL_CHARS);
        $lastName = filter_var($userInfo['lastName'], FILTER_SANITIZE_SPECIAL_CHARS);
        $email = filter_var($userInfo['email'], FILTER_VALIDATE_EMAIL);
        $phone = preg_match("/\(\d{3}\) \d{3}-\d{4}/", $userInfo['phone']) ? $userInfo['phone'] : null;

        if (!$email || !$phone) {
            echo json_encode(["error" => "Invalid email or phone format"]);
            http_response_code(400);
            return;
        }

        try {
            $stmt = $conn->prepare("UPDATE users SET first_name=:firstName, last_name=:lastName, email=:email, phone_number=:phone WHERE user_id=:userId");
            $stmt->execute([
                ':firstName' => $firstName,
                ':lastName' => $lastName,
                ':email' => $email,
                ':phone' => $phone,
                ':userId' => $userId
            ]);

            echo json_encode(["success" => "User info updated successfully"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
            http_response_code(500);
        }
    } elseif ($data['type'] === "notifications") {
        $notifications = $data['data'];

        try {
            $stmt = $conn->prepare("UPDATE notifications SET email_notif=:email, sms_notif=:sms, push_notif=:push WHERE user_id=:userId");
            $stmt->execute([
                ':email' => $notifications['email'] ? 1 : 0,
                ':sms' => $notifications['sms'] ? 1 : 0,
                ':push' => $notifications['push'] ? 1 : 0,
                ':userId' => $userId
            ]);

            echo json_encode(["success" => "Notification settings updated"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
            http_response_code(500);
        }
    }
}



function handleGetRequest() {
    global $conn;
    
    if (!isset($_GET['user_id'])) {
        echo json_encode(["error" => "User ID required"]);
        http_response_code(400);
        return;
    }

    $userId = intval($_GET['user_id']);

    try {
        // Fetch user info, including is_deleted
        $stmt = $conn->prepare("SELECT first_name, last_name, email, phone_number, is_deleted FROM users WHERE user_id=:userId");
        $stmt->execute([':userId' => $userId]);
        $userResult = $stmt->fetch(PDO::FETCH_ASSOC);

        // Fetch notification settings
        $stmt = $conn->prepare("SELECT email_notif, sms_notif, push_notif FROM notifications WHERE user_id=:userId");
        $stmt->execute([':userId' => $userId]);
        $notifications = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode(["user_info" => $userResult, "notifications" => $notifications]);
    } catch (PDOException $e) {
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        http_response_code(500);
    }
}




function handleDeleteRequest() {
    global $conn;
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['user_id'])) {
        echo json_encode(["error" => "Invalid request"]);
        http_response_code(400);
        return;
    }

    $userId = intval($data['user_id']);

    if (!isset($data['confirm']) || !$data['confirm']) {
        echo json_encode(["error" => "Account deletion not confirmed"]);
        http_response_code(400);
        return;
    }

    try {
        // Soft delete: Mark the account as inactive instead of deleting
        $stmt = $conn->prepare("UPDATE users SET is_deleted=1 WHERE user_id=:userId");
        $stmt->execute([':userId' => $userId]);

        echo json_encode(["success" => "Account deletion request processed"]);
    } catch (PDOException $e) {
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        http_response_code(500);
    }
}
?>
