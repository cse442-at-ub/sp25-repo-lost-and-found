<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json');

// Database connection
$host = 'localhost'; // Change as needed
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'dinalben';
$password = '50409149';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Check if form data is sent via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['itemName'] ?? ''; // Changed from 'name' to 'itemName' to match your React component
    $date = $_POST['dateFound'] ?? ''; // Changed from 'date' to 'dateFound' to match your React component
    $location = $_POST['location'] ?? '';
    $description = $_POST['description'] ?? '';
    $first_name = $_POST['firstName'] ?? ''; // Changed from 'first_name' to 'firstName' to match your React component
    $last_name = $_POST['lastName'] ?? ''; // Changed from 'last_name' to 'lastName' to match your React component
    $email_address = $_POST['email'] ?? ''; // Changed from 'email_address' to 'email' to match your React component
    $phone_number = $_POST['phone'] ?? ''; // Changed from 'phone_number' to 'phone' to match your React component
    $category = $_POST['category'] ?? ''; // Added category field

    // Handle File Upload
    $filePath = null;
    if (!empty($_FILES["image"]["name"])) { // Changed from "file" to "image" to match your React component
        $uploadDir = "uploads/"; // Ensure this directory exists and has write permissions
        $fileName = basename($_FILES["image"]["name"]); // Changed from "file" to "image" to match your React component
        $targetFilePath = $uploadDir . time() . "_" . $fileName; // Unique file name
        $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

        // Validate file type (optional, adjust as needed)
        $allowedTypes = ["jpg", "png", "pdf", "jpeg", "gif"];
        if (in_array($fileType, $allowedTypes)) {
            if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) { // Changed from "file" to "image" to match your React component
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
    $stmt = $conn->prepare("INSERT INTO found_items (id, name, category, date, location, description, first_name, last_name, email_address, phone_number, file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"); // Added category field to the SQL statement
    $id = NULL;
    $stmt->bind_param("sssssssssss", $id, $name, $category, $date, $location, $description, $first_name, $last_name, $email_address, $phone_number, $filePath); // Added category to the bind_param

    if ($stmt->execute()) {
        echo json_encode(["success" => "Record inserted successfully", "file_path" => $filePath]);
    } else {
        echo json_encode(["error" => "Failed to insert record"]);
    }

    $stmt->close();
}

$conn->close();
?>
