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
    error_log("Database connection failed: " . $conn->connect_error);
    echo json_encode([
        "success" => false, 
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    error_log("User not logged in, session: " . json_encode($_SESSION));
    echo json_encode([
        "success" => false, 
        "message" => "User not logged in"
    ]);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Log the query execution
    error_log("Fetching found items for user ID: $userId");
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
    if (!$stmt) {
        $error = $conn->error;
        error_log("Prepare failed: $error");
        throw new Exception("Prepare failed: $error");
    }
    $stmt->bind_param("i", $userId);
    if (!$stmt->execute()) {
        $error = $stmt->error;
        error_log("Execute failed: $error");
        throw new Exception("Execute failed: $error");
    }
    $result = $stmt->get_result();
    
    $items = [];
    while ($row = $result->fetch_assoc()) {
        if ($row['image']) {
            $row['image'] = "Backend/" . $row['image'];
        }
        $items[] = $row;
    }
    
    error_log("Successfully fetched " . count($items) . " items");
    echo json_encode([
        "success" => true,
        "items" => $items
    ]);
    
} catch (Exception $e) {
    error_log("Error in getFoundItems.php: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Error fetching found items: " . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>