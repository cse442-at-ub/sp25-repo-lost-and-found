<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

$host = "localhost";  
$dbname = "cse442_2025_spring_team_s_db";
$username = "addisony";
$password = "50399660";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed."]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        // Fetch all found items from the database
        $stmt = $conn->prepare("SELECT id, item_name, location_found, description FROM found_items");
        $stmt->execute();
        
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode(["status" => "success", "items" => $items]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to fetch items."]);
        exit();
    }
} elseif ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Get JSON input from the frontend for claiming an item
    $data = json_decode(file_get_contents("php://input"), true);
    
    $itemId = $data["itemId"] ?? "";
    $userId = $data["userId"] ?? ""; // You'll need to implement user authentication
    
    if (empty($itemId)) {
        http_response_code(400);
        echo json_encode(["error" => "Item ID is required."]);
        exit();
    }
    
    try {
        // Check if item exists
        $checkQuery = $conn->prepare("SELECT id FROM found_items WHERE id = ?");
        $checkQuery->execute([$itemId]);
        
        if ($checkQuery->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Item not found."]);
            exit();
        }
        
        // Here you would typically add logic to claim the item
        // For example, moving it to claimed_items table or updating status
        // This is just a placeholder for the actual claim logic
        
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Item claimed successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to claim item."]);
        exit();
    }
}
?>
