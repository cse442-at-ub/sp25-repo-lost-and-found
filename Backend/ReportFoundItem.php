<?php
// Start session to get user ID
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit;
}

// Get the user ID from the session
$userId = $_SESSION['user_id'];

$servername = "localhost";
$username = "dinalben"; // Replace with your MySQL username
$password = "50409149"; // Replace with your MySQL password
$database = "cse442_2025_spring_team_s_db";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed"]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $itemName = $_POST['itemName'] ?? '';
    $category = $_POST['category'] ?? '';
    $dateFound = $_POST['dateFound'] ?? '';
    $location = $_POST['location'] ?? '';
    $description = $_POST['description'] ?? '';
    $firstName = $_POST['firstName'] ?? '';
    $lastName = $_POST['lastName'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    
    if (!$itemName || !$category || !$dateFound) {
        echo json_encode(["success" => false, "message" => "Item name, category, and date found are required."]);
        exit;
    }
    
    $imagePath = "";
    if (!empty($_FILES['image']['name'])) {
        $imageFileName = time() . "_" . basename($_FILES['image']['name']);
        $imagePath = "uploads/" . $imageFileName;
        move_uploaded_file($_FILES['image']['tmp_name'], $imagePath);
    }
    
    // Update SQL query to include user_id column
    $stmt = $conn->prepare("INSERT INTO found_items (item_name, category, date_found, location_found, description, first_name, last_name, email, phone, image, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssssssi", $itemName, $category, $dateFound, $location, $description, $firstName, $lastName, $email, $phone, $imagePath, $userId);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Found item reported successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to report found item: " . $stmt->error]);
    }
    
    $stmt->close();
}

$conn->close();
?>