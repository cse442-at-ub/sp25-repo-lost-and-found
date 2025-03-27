<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

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

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the input data
    $input = json_decode(file_get_contents('php://input'), true);
    $lost_item_id = isset($input['lost_item_id']) ? intval($input['lost_item_id']) : null;
    $found_item_id = isset($input['found_item_id']) ? intval($input['found_item_id']) : null;

    // Validate input
    if ($lost_item_id === null || $found_item_id === null) {
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }

    // Prepare and bind the SQL statement
    $stmt = $conn->prepare("INSERT INTO matches (lost_item_id, found_item_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $lost_item_id, $found_item_id);

    // Execute the statement
    if ($stmt->execute()) {
        echo json_encode(["success" => "Items matched successfully"]);
    } else {
        echo json_encode(["error" => "Failed to match items"]);
    }

    // Close the statement
    $stmt->close();
} else {
    echo json_encode(["error" => "Invalid request method"]);
}

$conn->close();
?>