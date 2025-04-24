<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Start session to get user ID
session_start();
header('Content-Type: application/json');

// Include database connection
require_once 'db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "User not logged in"]);
    exit;
}

// Get the user ID from the session
$userId = $_SESSION['user_id'];

// Check if form data is sent via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $pdo = getDbConnection();
        
        $name = $_POST['name'] ?? '';
        $date = !empty($_POST['date']) ? $_POST['date'] : null; // Set to NULL if empty
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

        // Prepare SQL statement using PDO
        $sql = "INSERT INTO lost_items (name, date, last_seen_location, description, first_name, last_name, email_address, phone_number, file_path, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        
        // Log the values being inserted for debugging
        error_log("Attempting to insert values: " . print_r([
            'name' => $name,
            'date' => $date,
            'last_seen_location' => $last_seen_location,
            'description' => $description,
            'first_name' => $first_name,
            'last_name' => $last_name,
            'email_address' => $email_address,
            'phone_number' => $phone_number,
            'file_path' => $filePath,
            'user_id' => $userId
        ], true));
        
        if ($stmt->execute([$name, $date, $last_seen_location, $description, $first_name, $last_name, $email_address, $phone_number, $filePath, $userId])) {
            // Get the newly inserted ID
            $newItemId = $pdo->lastInsertId();
            
            echo json_encode([
                "success" => "Record inserted successfully", 
                "file_path" => $filePath,
                "item_id" => $newItemId
            ]);
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("SQL Error: " . print_r($errorInfo, true));
            echo json_encode([
                "error" => "Failed to insert record",
                "sql_error" => $errorInfo[2]
            ]);
        }
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        error_log("SQL State: " . $e->getCode());
        error_log("Error Info: " . print_r($e->errorInfo, true));
        echo json_encode([
            "error" => "Database error occurred",
            "message" => $e->getMessage(),
            "code" => $e->getCode()
        ]);
    }
}
?>