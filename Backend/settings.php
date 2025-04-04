<?php

// Allow requests from frontend (adjust to match your actual frontend URL)
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight requests (OPTIONS method)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
header("Content-Type: application/json");

// Database Connection
$host = "localhost";
$dbname = "cse442_2025_spring_team_s_db";
$username = "shanoyah";
$password = "50400377";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Ensure user is logged in before processing any request
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "Unauthorized"]);
    http_response_code(401);
    exit;
}

$userId = $_SESSION["user_id"]; // Retrieve from session

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetRequest($conn, $userId);
        break;
    case 'POST':
        handlePostRequest($conn, $userId);
        break;
    case 'DELETE':
        handleDeleteRequest($conn, $userId);
        break;
    default:
        echo json_encode(["error" => "Invalid request method"]);
        http_response_code(405);
}

// Functions for Handling Requests (Updated to Use Session User ID)

// Function to Get User Data
function handleGetRequest($conn, $userId) {
    try {
        // Fetch user info
        $stmt = $conn->prepare("SELECT first_name, last_name, email, phone_number, is_deleted FROM users WHERE user_id=:userId");
        $stmt->execute([':userId' => $userId]);
        $userResult = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$userResult) {
            echo json_encode(["error" => "No user found"]);
            return;
        }

        // If user is deleted, end session and force logout
        if ($userResult['is_deleted'] == 1) {
            echo json_encode(["error" => "Account deleted. Redirecting ..."]);
            http_response_code(403); // Forbidden
            exit();
        }

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

// Function to Update User Info or Notifications
function handlePostRequest($conn, $userId) {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['data']) || !isset($data['type'])) {
        echo json_encode(["error" => "Invalid input"]);
        http_response_code(400);
        return;
    }

    if ($data['type'] === "userInfo") {
        updateUserInfo($conn, $userId, $data['data']);
    } elseif ($data['type'] === "notifications") {
        updateNotifications($conn, $userId, $data['data']);
    } else {
        echo json_encode(["error" => "Invalid update type"]);
        http_response_code(400);
    }
}

// Function to Check if Email or Phone is Already in Use
function isEmailOrPhoneInUse($conn, $userId, $field, $value) {
    try {
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE $field = :value AND user_id != :userId AND is_deleted = 0");
        $stmt->execute([':value' => $value, ':userId' => $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
    } catch (PDOException $e) {
        return false; // Error occurred, default to not in use
    }
}

// Function to Update User Info
function updateUserInfo($conn, $userId, $userInfo) {
    try {
        // Check if any values are empty
        foreach (['firstName', 'lastName', 'email'] as $field) {
            if (empty($userInfo[$field])) {
                echo json_encode(["error" => "Required field $field cannot be empty"]);
                http_response_code(400);
                return;
            }
        }

        // Validate and sanitize email
        $email = filter_var($userInfo['email'], FILTER_VALIDATE_EMAIL);
        if (!$email) {
            echo json_encode(["error" => "Invalid email format"]);
            http_response_code(400);
            return;
        }

        // Validate phone format if provided
        $phone = null;
        if (!empty($userInfo['phone'])) {
            if (!preg_match("/\(\d{3}\) \d{3}-\d{4}/", $userInfo['phone'])) {
                echo json_encode(["error" => "Invalid phone format. Use (XXX) XXX-XXXX"]);
                http_response_code(400);
                return;
            }
            $phone = $userInfo['phone'];
        }

        // Check if email is already in use by another user
        if (isEmailOrPhoneInUse($conn, $userId, 'email', $email)) {
            echo json_encode(["error" => "Email is already in use by another user"]);
            http_response_code(409); // Conflict
            return;
        }

        // Check if phone is already in use by another user (if provided)
        if ($phone && isEmailOrPhoneInUse($conn, $userId, 'phone_number', $phone)) {
            echo json_encode(["error" => "Phone number is already in use by another user"]);
            http_response_code(409); // Conflict
            return;
        }

        // Update user information
        $stmt = $conn->prepare("UPDATE users SET first_name=:firstName, last_name=:lastName, email=:email, phone_number=:phone WHERE user_id=:userId");
        $stmt->execute([
            ':firstName' => filter_var($userInfo['firstName'], FILTER_SANITIZE_SPECIAL_CHARS),
            ':lastName' => filter_var($userInfo['lastName'], FILTER_SANITIZE_SPECIAL_CHARS),
            ':email' => $email,
            ':phone' => $phone,
            ':userId' => $userId
        ]);

        echo json_encode(["success" => "User info updated successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        http_response_code(500);
    }
}

// Function to Update Notifications
function updateNotifications($conn, $userId, $notifications) {
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

// Function to Handle Account Deletion
function handleDeleteRequest($conn, $userId) {
    try {
        $stmt = $conn->prepare("UPDATE users SET is_deleted=1 WHERE user_id=:userId");
        $stmt->execute([':userId' => $userId]);

        echo json_encode(["success" => "Account deletion request processed"]);
    } catch (PDOException $e) {
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        http_response_code(500);
    }
}
?>