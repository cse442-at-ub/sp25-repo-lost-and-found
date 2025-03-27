<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

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

// Check for POST request
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Get input data
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($input['id']) || !isset($input['approved'])) {
        echo json_encode(["error" => "Missing required parameters"]);
        exit;
    }

    $id = intval($input['id']); // Ensure ID is an integer
    $approved = $input['approved']; // Can be null, 0, or 1

    // Prepare and execute query
    $stmt = $conn->prepare("UPDATE claims SET approved = ? WHERE id = ?");
    $stmt->bind_param("si", $approved, $id); // "s" allows NULL values

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Claim updated successfully"]);
    } else {
        echo json_encode(["error" => "Failed to update claim"]);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "Invalid request method"]);
}

$conn->close();
?>
