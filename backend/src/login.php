<?php
session_start(); // Must be at the top before any output
include 'config.php'; // Include database connection

header('Content-Type: application/json'); // Ensure JSON response

// Read and decode JSON input
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

// Validate JSON input
if ($data === null) {
    echo json_encode(["success" => false, "error" => "Invalid JSON data."]);
    exit;
}

// Extract user input safely
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

// Validate input
if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "error" => "Email and password are required."]);
    exit;
}


// Query user
$query = "SELECT id, password FROM users WHERE TRIM(LOWER(email)) = TRIM(LOWER(?))";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "error" => "Email not found.", "input_email" => $email]);
    exit;
}

$user = $result->fetch_assoc();

// Debugging: Check stored password
if (!password_verify($password, $user['password'])) {
    echo json_encode(["success" => false, "error" => "Invalid password.", "stored_password" => $user['password']]);
    exit;
}

// Success
$_SESSION['id'] = $user['id'];
echo json_encode(["success" => true, "message" => "Login successful!", "user_id" => $user['id']]);

$stmt->close();
$conn->close();
?>
