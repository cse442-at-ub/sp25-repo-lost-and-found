<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Start session to get user ID
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

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "User not logged in"]);
    exit;
}

// Get the user ID from the session
$userId = $_SESSION['user_id'];

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

    // Prepare SQL statement including user_id
    $stmt = $conn->prepare("INSERT INTO lost_items (id, name, date, last_seen_location, description, first_name, last_name, email_address, phone_number, file_path, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $id = NULL;
    $stmt->bind_param("ssssssssssi", $id, $name, $date, $last_seen_location, $description, $first_name, $last_name, $email_address, $phone_number, $filePath, $userId);

    if ($stmt->execute()) {
        // Get the newly inserted ID
        $newItemId = $stmt->insert_id;
        
        // Include notification helper if necessary
        // require_once 'notification_helper.php';
        
        // Send a confirmation notification to the user
        // createNotification(
        //     $userId,
        //     'Lost Item Reported',
        //     'Your lost item report has been submitted successfully.',
        //     'info',
        //     "/report-lost-item?id=$newItemId",
        //     "Your report for the lost $name has been recorded. We'll notify you if a matching item is found."
        // );
        
        echo json_encode([
            "success" => "Record inserted successfully", 
            "file_path" => $filePath,
            "item_id" => $newItemId
        ]);
    } else {
        echo json_encode(["error" => "Failed to insert record: " . $stmt->error]);
    }

    $stmt->close();
}

$conn->close();
?>