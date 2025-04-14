<?php

ini_set('display_errors', 1); // For development only!
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Database configuration
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'dinalben';
$password = '50409149';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    exit;
}

// Start the session
session_start();
$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'User not authenticated']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['name'], $data['email'], $data['deliveryMethod'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields.']);
        exit;
    }

    $name = trim($data['name']);
    $email = trim($data['email']);
    $deliveryMethod = $data['deliveryMethod'];
    $preferredTime = $data['preferredTime'] ?? null;
    $additionalInstructions = $data['additionalInstructions'] ?? '';
    $pickupLocation = $data['pickupLocation'] ?? '';
    $address = $data['address'] ?? '';
    $county = $data['county'] ?? '';
    $state = $data['state'] ?? '';
    $zipcode = $data['zipcode'] ?? '';

    try {
        $stmt = $pdo->prepare("
            INSERT INTO retrieve_requests (
                user_id, name, email, delivery_method, preferred_time,
                additional_instructions, pickup_location, address,
                county, state, zipcode, submitted_at
            ) VALUES (
                :user_id, :name, :email, :delivery_method, :preferred_time,
                :additional_instructions, :pickup_location, :address,
                :county, :state, :zipcode, NOW()
            )
        ");

        $stmt->execute([
            ':user_id' => $userId,
            ':name' => $name,
            ':email' => $email,
            ':delivery_method' => $deliveryMethod,
            ':preferred_time' => $preferredTime,
            ':additional_instructions' => $additionalInstructions,
            ':pickup_location' => $pickupLocation,
            ':address' => $address,
            ':county' => $county,
            ':state' => $state,
            ':zipcode' => $zipcode
        ]);

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save request: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}
?>
