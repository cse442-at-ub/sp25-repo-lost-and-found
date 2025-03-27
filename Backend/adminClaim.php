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

// Query to select all columns from claims, users, and the corresponding items table
$sql = "
    SELECT 
        claims.*, 
        users.*, 
        lost_items.*, 
        found_items.* 
    FROM claims
    LEFT JOIN users ON claims.user_id = users.user_id
    LEFT JOIN lost_items ON claims.claim_type = 'lost' AND claims.item_id = lost_items.id
    LEFT JOIN found_items ON claims.claim_type = 'found' AND claims.item_id = found_items.id
";

$result = $conn->query($sql);

if ($result) {
    $claims = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($claims);
} else {
    echo json_encode(["error" => "Query failed"]);
}

$conn->close();
?>
