<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json');

// Database configuration
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'dinalben';
$password = '50409149';

try {
    // Establish PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if form data is sent via POST
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $itemName = $_POST['itemName'] ?? '';
        $category = $_POST['category'] ?? '';
        $dateFound = $_POST['dateFound'] ?? '';
        $location = $_POST['location'] ?? '';
        $description = $_POST['description'] ?? '';
        $firstName = $_POST['firstName'] ?? '';
        $lastName = $_POST['lastName'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phone'] ?? '';

        // Handle File Upload
        $imagePath = null;
        if (!empty($_FILES["image"]["name"])) {
            $uploadDir = "uploads/"; // Ensure this directory exists and has write permissions
            $fileName = time() . "_" . basename($_FILES["image"]["name"]); // Unique file name
            $targetFilePath = $uploadDir . $fileName;
            $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

            // Allowed file types
            $allowedTypes = ["jpg", "png", "jpeg", "gif"];
            if (in_array($fileType, $allowedTypes)) {
                if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) {
                    $imagePath = $targetFilePath;
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
        $stmt = $pdo->prepare("INSERT INTO found_items (item_name, category, date_found, location_found, description, first_name, last_name, email, phone, image) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$itemName, $category, $dateFound, $location, $description, $firstName, $lastName, $email, $phone, $imagePath]);

        echo json_encode(["success" => "Found item reported successfully!", "image_path" => $imagePath]);
    }
} catch (PDOException $e) {
    // Handle database errors
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
