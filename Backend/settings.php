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
    $_SESSION["user_id"] = 1; // testing
    ////echo json_encode(["error" => "Unauthorized"]);
    //http_response_code(401);
    //exit;
}

$userId = $_SESSION["user_id"]; //  Retrieve from session



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
            echo json_encode(["error" => "No user found with user_id = $userId"]);
            return;
        }

        // Fetch notification settings
        $stmt = $conn->prepare("SELECT email_notif, sms_notif, push_notif FROM notifications WHERE user_id=:userId");
        $stmt->execute([':userId' => $userId]);
        $notifications = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$notifications) {
            echo json_encode(["error" => "No notification settings found for user_id = $userId"]);
            return;
        }

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

// Function to Update User Info
function updateUserInfo($conn, $userId, $userInfo) {
    try {
        $stmt = $conn->prepare("UPDATE users SET first_name=:firstName, last_name=:lastName, email=:email, phone_number=:phone WHERE user_id=:userId");
        $stmt->execute([
            ':firstName' => filter_var($userInfo['firstName'], FILTER_SANITIZE_SPECIAL_CHARS),
            ':lastName' => filter_var($userInfo['lastName'], FILTER_SANITIZE_SPECIAL_CHARS),
            ':email' => filter_var($userInfo['email'], FILTER_VALIDATE_EMAIL),
            ':phone' => preg_match("/\(\d{3}\) \d{3}-\d{4}/", $userInfo['phone']) ? $userInfo['phone'] : null,
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