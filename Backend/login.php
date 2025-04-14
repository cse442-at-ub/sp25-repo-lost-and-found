<?php
// Database configuration
require_once 'db.php';
require_once 'session.php';

try {
    // Establish PDO connection
    $pdo = getDbConnection();

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

            // Prepare and execute the SQL query
            $stmt2 = $pdo->prepare("SELECT user_id, is_admin FROM users WHERE email = ?");
            $stmt2->execute([$email]);
            $result = $stmt2->fetch();
            $user_id = $result['user_id'];
            $is_admin = $result['is_admin'] != 0;

            if ($hashedPassword && password_verify($password, $hashedPassword)) {
                session_start();
                $_SESSION["user_id"] = $user_id;
                startSession($user_id, $is_admin);
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


