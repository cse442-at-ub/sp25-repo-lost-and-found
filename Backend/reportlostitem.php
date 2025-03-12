<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

session_start();
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

// Check if form data is sent via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'] ?? '';
    $date = $_POST['date'] ?? '';
    $last_seen_location = $_POST['last_seen_location'] ?? '';
    $description = $_POST['description'] ?? '';
    $first_name = $_POST['first_name'] ?? '';
    $last_name = $_POST['last_name'] ?? '';
    $email_address = $_POST['email_address'] ?? '';
    $phone_number = $_POST['phone_number'] ?? '';

    // Prepare SQL statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO lost_items (id, name, date, last_seen_location, description, first_name, last_name, email_address, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $id = NULL;
    $stmt->bind_param("sssssssss", $id, $name, $date, $last_seen_location, $description, $first_name, $last_name, $email_address, $phone_number);

    if ($stmt->execute()) {
        echo json_encode(["success" => "Record inserted successfully"]);
    } else {
        echo json_encode(["error" => "Failed to insert record"]);
    }

    $stmt->close();
}

$conn->close();
?>
