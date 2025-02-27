<?php
require_once "config.php"; // Include DB connection

header("Content-Type: application/json");

// Ensure the request method is POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die(json_encode(["success" => false, "message" => "Invalid request method."]));
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($data['username']) || !isset($data['password']) || !isset($data['email'])) {
    die(json_encode(["success" => false, "message" => "Missing required fields."]));
}

$username = $conn->real_escape_string($data['username']);
$email = $conn->real_escape_string($data['email']);
$password = password_hash($data['password'], PASSWORD_BCRYPT); // Secure password

// Check if user already exists
$check_sql = "SELECT id FROM users WHERE email = ?";
$stmt = $conn->prepare($check_sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    die(json_encode(["success" => false, "message" => "Email already registered."]));
}
$stmt->close();

// Insert new user
$insert_sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
$stmt = $conn->prepare($insert_sql);
$stmt->bind_param("sss", $username, $email, $password);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Registration successful."]);
} else {
    echo json_encode(["success" => false, "message" => "Registration failed: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
