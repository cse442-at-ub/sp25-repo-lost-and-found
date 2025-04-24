<?php
/**
 * getAvailableItems.php - Returns items available for retrieval by the logged-in user
 * 
 * This file fetches found items that have been matched with the user's lost items
 * and are available for retrieval.
 */

// Start session to access user info
session_start();
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'blaketur'; // Replace with appropriate credentials
$password = '50519587'; // Replace with appropriate credentials

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode([
        "success" => false, 
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false, 
        "message" => "User not logged in"
    ]);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Find all found items that:
    // 1. Have been matched with this user's lost items
    // 2. Have not been retrieved yet (not in retrieve_requests)
    $sql = "
        SELECT 
            f.id,
            f.item_name,
            f.location_found,
            f.description,
            f.date_found,
            f.category,
            f.image
        FROM 
            found_items f
        INNER JOIN 
            matches m ON f.id = m.found_item_id
        INNER JOIN 
            lost_items l ON m.lost_item_id = l.id
        WHERE 
            l.user_id = ? 
            AND f.id NOT IN (
                SELECT found_item_id FROM retrieve_requests WHERE user_id = ?
            )
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $userId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "items" => $items
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error fetching available items: " . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>