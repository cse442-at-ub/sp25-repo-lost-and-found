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
    $item_name = $_POST['name'] ?? ''; // Corrected to match your table
    $category = $_POST['category'] ?? ''; // Added category
    $date_found = $_POST['date_found'] ?? '';
    $location_found = $_POST['found_location'] ?? ''; // Corrected to match your table
    $description = $_POST['description'] ?? '';
    $first_name = $_POST['finder_first_name'] ?? ''; // Corrected to match your table
    $last_name = $_POST['finder_last_name'] ?? ''; // Corrected to match your table
    $email = $_POST['finder_email_address'] ?? ''; // Corrected to match your table
    $phone = $_POST['finder_phone_number'] ?? ''; // Corrected to match your table

    // Handle File Upload
    $image = null; // Corrected to match your table
    if (!empty($_FILES["file"]["name"])) {
        $uploadDir = "uploads/"; // Ensure this directory exists and has write permissions
        $fileName = basename($_FILES["file"]["name"]);
        $targetFilePath = $uploadDir . time() . "_" . $fileName; // Unique file name
        $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

        // Validate file type (optional, adjust as needed)
        $allowedTypes = ["jpg", "png", "pdf", "jpeg", "gif"];
        if (in_array($fileType, $allowedTypes)) {
            if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFilePath)) {
                $image = $targetFilePath; // Corrected to match your table
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
    $stmt = $conn->prepare("INSERT INTO found_items (item_name, category, date_found, location_found, description, first_name, last_name, email, phone, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssssss", $item_name, $category, $date_found, $location_found, $description, $first_name, $last_name, $email, $phone, $image);

    if ($stmt->execute()) {
        echo json_encode(["success" => "Record inserted successfully", "image_path" => $image]);
    } else {
        echo json_encode(["error" => "Failed to insert record"]);
    }

    $stmt->close();
}

$conn->close();
?>
