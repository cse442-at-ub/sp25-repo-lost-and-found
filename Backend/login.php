<?php
// Database configuration
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'dinalben';
$password = '50409149';

try {
    // Establish PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    header('Content-Type: application/json');

    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get JSON data from the request body
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        // Check if email and password are provided
        if (isset($data['email']) && isset($data['password'])) {
            $email = $data['email'];
            $password = $data['password'];

            // Prepare and execute the SQL query
            $stmt = $pdo->prepare("SELECT password FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $hashedPassword = $stmt->fetchColumn();

            if ($hashedPassword && password_verify($password, $hashedPassword)) {
                echo json_encode(["success" => true, "message" => "Login successful"]);
            } else {
                echo json_encode(["success" => false, "message" => "Invalid email or password"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Email and password required"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Method not allowed"]);
    }
} catch (PDOException $e) {
    // Handle database errors
    http_response_code(500); // Internal Server Error
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}

?>


