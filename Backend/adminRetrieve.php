<?php
// Start session to verify admin status
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'User not authenticated']);
    exit();
}

// Check if user is admin (using the is_admin cookie)
if (!isset($_COOKIE['is_admin']) || $_COOKIE['is_admin'] !== 'true') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Admin access required']);
    exit();
}

header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'dinalben'; // Replace with your username
$password = '50409149'; // Replace with your password

try {
    $conn = new mysqli($host, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
    // Query to get retrieve requests with user and item information
    // Adjusted for your current database structure
    $query = "SELECT 
                rr.*,
                u.first_name,
                u.last_name,
                u.email as user_email,
                fi.item_name,
                fi.description as item_description,
                fi.image as item_image,
                fi.location_found
              FROM retrieve_requests rr
              JOIN users u ON rr.user_id = u.user_id
              JOIN found_items fi ON rr.found_item_id = fi.id
              ORDER BY 
                CASE 
                  WHEN rr.status IS NULL OR rr.status = 'pending' THEN 1
                  WHEN rr.status = 'ready for pickup' THEN 2
                  WHEN rr.status = 'sent via mail' THEN 3
                  ELSE 4
                END,
                rr.submitted_at DESC";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $requests = [];
    while ($row = $result->fetch_assoc()) {
        // Ensure status has a value (for older entries that might have NULL)
        if ($row['status'] === null) {
            $row['status'] = 'pending';
        }
        
        $requests[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $requests
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
    
    // Log the error
    error_log("Error in adminRetrieve.php: " . $e->getMessage());
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>