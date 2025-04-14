<?php
require_once 'db.php';

header('Content-Type: application/json');

// Get the request data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields'
    ]);
    exit;
}

try {
    $pdo = getDbConnection();
    
    // Update the status
    $query = "UPDATE retrieve_requests SET status = :status WHERE id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':status' => $data['status'],
        ':id' => $data['id']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Status updated successfully'
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?> 