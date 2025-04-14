<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $pdo = getDbConnection();
    
    // Query to get retrieve requests with user information
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
              ORDER BY rr.submitted_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $requests
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?> 