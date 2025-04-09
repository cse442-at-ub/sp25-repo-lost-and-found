<?php
session_start();
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'your_username';
$password = 'your_password';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Get active items (from main tables)
    $lostItemsQuery = $conn->prepare("
        SELECT 
            id, 
            'lost' as item_type,
            'active' as status,
            name as item_name, 
            date,
            last_seen_location as location, 
            description,
            file_path as image
        FROM 
            lost_items 
        WHERE 
            user_id = ?
    ");
    $lostItemsQuery->bind_param("i", $userId);
    $lostItemsQuery->execute();
    $lostResult = $lostItemsQuery->get_result();
    
    $foundItemsQuery = $conn->prepare("
        SELECT 
            id, 
            'found' as item_type,
            'active' as status,
            item_name, 
            date_found as date,
            location_found as location, 
            description,
            image
        FROM 
            found_items 
        WHERE 
            user_id = ?
    ");
    $foundItemsQuery->bind_param("i", $userId);
    $foundItemsQuery->execute();
    $foundResult = $foundItemsQuery->get_result();
    
    // By default, only include active items
    $items = [];
    
    while ($row = $lostResult->fetch_assoc()) {
        $items[] = $row;
    }
    
    while ($row = $foundResult->fetch_assoc()) {
        $items[] = $row;
    }
    
    // Only get archived items if specifically requested
    $includeArchived = isset($_GET['include_archived']) && $_GET['include_archived'] === 'true';
    
    if ($includeArchived) {
        // Get archived lost items
        $archivedLostQuery = $conn->prepare("
            SELECT 
                id, 
                'lost' as item_type,
                'archived' as status,
                name as item_name, 
                date,
                last_seen_location as location, 
                description,
                file_path as image,
                archived_at
            FROM 
                archived_lost_items 
            WHERE 
                user_id = ?
        ");
        $archivedLostQuery->bind_param("i", $userId);
        $archivedLostQuery->execute();
        $archivedLostResult = $archivedLostQuery->get_result();
        
        // Get archived found items
        $archivedFoundQuery = $conn->prepare("
            SELECT 
                id, 
                'found' as item_type,
                'archived' as status,
                item_name, 
                date_found as date,
                location_found as location, 
                description,
                image,
                archived_at
            FROM 
                archived_found_items 
            WHERE 
                user_id = ?
        ");
        $archivedFoundQuery->bind_param("i", $userId);
        $archivedFoundQuery->execute();
        $archivedFoundResult = $archivedFoundQuery->get_result();
        
        while ($row = $archivedLostResult->fetch_assoc()) {
            $items[] = $row;
        }
        
        while ($row = $archivedFoundResult->fetch_assoc()) {
            $items[] = $row;
        }
    }
    
    echo json_encode([
        "success" => true,
        "items" => $items
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error fetching items: " . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>