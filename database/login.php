<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

$servername = "localhost"; // or aptitude.cse.buffalo.edu for testing
$username = "your_ubit_username";
$password = "your_8_digit_person_number";
$database = "cse442_2025_spring_team_s_db";

// Create a connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed"]));
}

// Read JSON input
$data = json_decode(file_get_contents("php://input"));

// Validate email and password
if (!isset($data->email) || !isset($data->password)) {
    die(json_encode(["success" => false, "message" => "Email and password required"]));
}

$email = $conn->real_escape_string($data->email);
$password = $conn->real_escape_string($data->password);

// Query the database
$sql = "SELECT * FROM users WHERE email='$email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    // Verify password (assuming passwords are hashed)
    if (password_verify($password, $user['password'])) {
        echo json_encode(["success" => true, "message" => "Login successful"]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid credentials"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found"]);
}

$conn->close();
?>
