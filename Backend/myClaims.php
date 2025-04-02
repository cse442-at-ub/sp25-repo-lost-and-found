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
    // Fetch all claims made by this user, along with item details
    $sql = "
        SELECT 
            c.*,
            -- Found item details
            f.item_name, f.location_found, f.description as found_description, f.image,
            -- Lost item details
            l.name, l.last_seen_location, l.description as lost_description, l.file_path
        FROM 
            claims c
        LEFT JOIN 
            found_items f ON c.claim_type = 'found' AND c.item_id = f.id
        LEFT JOIN 
            lost_items l ON c.claim_type = 'lost' AND c.item_id = l.id
        WHERE 
            c.user_id = ?
        ORDER BY 
            c.created_at DESC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $claims = [];
    while ($row = $result->fetch_assoc()) {
        // Process different descriptions based on claim type
        if ($row['claim_type'] === 'found') {
            $row['description'] = $row['found_description'];
            unset($row['found_description']);
            unset($row['lost_description']);
        } else {
            $row['description'] = $row['lost_description'];
            unset($row['found_description']);
            unset($row['lost_description']);
        }
        
        $claims[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "claims" => $claims
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error fetching claims: " . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>