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

    // Handle File Upload
    $filePath = null;
    if (!empty($_FILES["file"]["name"])) {
        $uploadDir = "uploads/"; // Ensure this directory exists and has write permissions
        $fileName = basename($_FILES["file"]["name"]);
        $targetFilePath = $uploadDir . time() . "_" . $fileName; // Unique file name
        $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

        // Validate file type (optional, adjust as needed)
        $allowedTypes = ["jpg", "png", "pdf", "jpeg", "gif"];
        if (in_array($fileType, $allowedTypes)) {
            if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFilePath)) {
                $filePath = $targetFilePath;
            } else {
                echo json_encode(["error" => "File upload failed"]);
                exit;
            }
        } else {
            echo json_encode(["error" => "Invalid file type"]);
            exit;
        }
    }

    // Prepare SQL statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO lost_items (id, name, date, last_seen_location, description, first_name, last_name, email_address, phone_number, file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $id = NULL;
    $stmt->bind_param("ssssssssss", $id, $name, $date, $last_seen_location, $description, $first_name, $last_name, $email_address, $phone_number, $filePath);

    if ($stmt->execute()) {
        echo json_encode(["success" => "Record inserted successfully", "file_path" => $filePath]);
    } else {
        echo json_encode(["error" => "Failed to insert record"]);
    }

    $stmt->close();
}

$conn->close();
?>
