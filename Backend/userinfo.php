<?php
session_start();
//$_SESSION["user_id"] = "1";
header('Content-Type: application/json');

// Database connection
$host = 'localhost'; // Change as needed
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'blaketur';
$password = '50519587';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "User not logged in"]);
    exit;
}

$userid = $_SESSION['user_id'];

// Prepare SQL statement
$stmt = $conn->prepare("SELECT first_name FROM users WHERE user_id = ?");
$stmt->bind_param("i", $userid);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(["user_id" => $userid, "name" => $row['first_name']]);
} else {
    echo json_encode(["error" => "User not found"]);
}

$stmt->close();
$conn->close();
?>