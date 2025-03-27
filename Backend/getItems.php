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

// Fetch lost items
$lostItemsQuery = "SELECT * FROM lost_items";
$foundItemsQuery = "SELECT * FROM found_items";

$lostItemsResult = $conn->query($lostItemsQuery);
$foundItemsResult = $conn->query($foundItemsQuery);

$lostItems = [];
$foundItems = [];

// Fetch lost items
if ($lostItemsResult->num_rows > 0) {
    while ($row = $lostItemsResult->fetch_assoc()) {
        $lostItems[] = [
            'id' => $row['id'],
            'name' => $row['name'], // Assuming 'name' is the correct column name
            'type' => 'Lost',
            'reportedBy' => $row['first_name'] . ' ' . $row['last_name'], // Combine first and last name
            'date' => $row['date'], // Assuming 'date' is the correct column name
            'image' => $row['file_path'], // Assuming 'file_path' is the correct column name for the image
            'description' => $row['description'],
            'location' => $row['last_seen_location'], // Assuming 'last_seen_location' is the correct column name
        ];
    }
}

// Fetch found items
if ($foundItemsResult->num_rows > 0) {
    while ($row = $foundItemsResult->fetch_assoc()) {
        $foundItems[] = [
            'id' => $row['id'],
            'name' => $row['item_name'], // Assuming 'item_name' is the correct column name
            'type' => 'Found',
            'reportedBy' => $row['first_name'] . ' ' . $row['last_name'], // Combine first and last name
            'date' => $row['date_found'], // Assuming 'date_found' is the correct column name
            'image' => $row['image'], // Assuming 'image' is the correct column name for the image
            'description' => $row['description'],
            'location' => $row['location_found'], // Assuming 'location_found' is the correct column name
        ];
    }
}

// Combine lost and found items
$items = array_merge($lostItems, $foundItems);
echo json_encode($items);

$conn->close();
?>