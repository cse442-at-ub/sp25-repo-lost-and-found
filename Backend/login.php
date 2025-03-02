<?php
header("Access-Control-Allow-Origin: *"); // Allow all origins (use frontend URL in production)
//$allowed_origin = "http://localhost:5173";
//header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($_SERVER["CONTENT_TYPE"] !== "application/json") {
    die(json_encode(["success" => false, "message" => "Invalid Content-Type"]));
}


ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Establish connection to MySQL
$servername = "localhost";
$username = "dinalben";  // Your MySQL username
$password = "50409149";      // Your MySQL password
$dbname = "cse442_2025_spring_team_s_db"; // Your MySQL database name

$conn = new mysqli($servername, $username, $password, $dbname);


if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}


// Get input data
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    die(json_encode(["success" => false, "message" => "Invalid JSON input."]));
}

$password = $data['password'];
$email = $conn->real_escape_string($data['email']);

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    // Debug logs (check your PHP error log)
    error_log("Input password: '" . trim($password) . "'");
    error_log("Stored password: '" . trim($user['password']) . "'");
    //if (password_verify($password, $user['password'])) { 
    if (password_verify($password, $user['password'])) { 
        echo json_encode([
            "success" => true,
            "message" => "Login successful!",
            "user" => [
                "id" => $user["user_id"],
                "email" => $user["email"]
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found."]);
}

$stmt->close();
$conn->close();
?>


