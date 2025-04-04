<?php
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
    // Fetch found items that are available to claim (not claimed yet)
    // Exclude items already claimed by this user
    $sql = "SELECT 
                f.id, 
                f.item_name, 
                f.location_found, 
                f.description, 
                f.date_found, 
                f.category,
                f.image
            FROM 
                found_items f
            WHERE 
                f.id NOT IN (
                    SELECT 
                        c.item_id 
                    FROM 
                        claims c 
                    WHERE 
                        c.claim_type = 'found' AND c.approved = 1
                )
                AND f.id NOT IN (
                    SELECT 
                        c.item_id 
                    FROM 
                        claims c 
                    WHERE 
                        c.claim_type = 'found' AND c.user_id = ?
                )
            ORDER BY 
                f.date_found DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $items = [];
    while ($row = $result->fetch_assoc()) {
        // Create image path for frontend use
        if ($row['image']) {
            // Assuming images are stored in a specific directory
            $row['image'] = "Backend/" . $row['image'];
        }
        $items[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "items" => $items
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error fetching found items: " . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>