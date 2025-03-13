<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

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
    
    $stmt = $conn->prepare("INSERT INTO found_items (item_name, category, date_found, location_found, description, first_name, last_name, email, phone, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssssss", $itemName, $category, $dateFound, $location, $description, $firstName, $lastName, $email, $phone, $imagePath);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Found item reported successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to report found item."]);
    }
    
    $stmt->close();
}

$conn->close();
?>
