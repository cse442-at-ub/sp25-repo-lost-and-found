<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

$host = "localhost";  
$dbname = "cse442_2025_spring_team_s_db";
$username = "addisony";
$password = "50399660";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed."]);
    exit();
}

// Get JSON input from the frontend
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $firstName = $data["firstName"] ?? "";
    $lastName = $data["lastName"] ?? "";
    $username = $data["username"] ?? "";
    $email = $data["email"] ?? "";
    $password = $data["password"] ?? "";

    if (empty($firstName) || empty($lastName) || empty($username) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["error" => "All fields are required."]);
        exit();
    }

    // Hash password for security
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    try {
        // Check if email exists
        $checkQuery = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
        $checkQuery->execute([$email]);

        if ($checkQuery->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["error" => "Email already registered"]);
            exit();
        }

        // Insert user into `users` table
        $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$firstName, $lastName, $username, $email, $hashedPassword]);

        // Get the inserted user's ID
        $userId = $conn->lastInsertId();

        // Insert default notification settings (all ON)
        $notifStmt = $conn->prepare("INSERT INTO notifications (user_id, email_notif, sms_notif, push_notif) VALUES (?, 1, 1, 1)");
        $notifStmt->execute([$userId]);

        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Registration successful"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error."]);
        exit();
    }
}
?>
