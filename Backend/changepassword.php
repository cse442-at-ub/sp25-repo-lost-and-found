<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Database configuration
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'shanoyah';
$password = '50400377';

try {
    // Establish PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Start session for user authentication
    session_start();
    
    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method not allowed"]);
        exit;
    }
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized. Please log in."]);
        exit;
    }
    
    // Get the user ID from the session
    $userId = $_SESSION['user_id'];
    

    // Get JSON data from the request body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Validate required fields
    if (!isset($data['currentPassword']) || !isset($data['newPassword']) || !isset($data['confirmPassword'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }
    
    $currentPassword = $data['currentPassword'];
    $newPassword = $data['newPassword'];
    $confirmPassword = $data['confirmPassword'];
    
    // Check if new password and confirm password match
    if ($newPassword !== $confirmPassword) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Passwords do not match"]);
        exit;
    }
    
    // Validate password requirements
    if (!validatePassword($newPassword)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Please meet all password requirements"]);
        exit;
    }
    
    // Get user data from database using prepared statement
    $stmt = $pdo->prepare("SELECT password FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    $hashedPassword = $stmt->fetchColumn();
    
    if (!$hashedPassword) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }
    
    // Verify current password using password_verify
    if (!password_verify($currentPassword, $hashedPassword)) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Current password is incorrect"]);
        exit;
    }
    
    // Hash the new password
    $newHashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
    
    // Update the password in the database
    $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE user_id = ?");
    $updateResult = $updateStmt->execute([$newHashedPassword, $userId]);
    
    if ($updateResult) {
        // Password updated successfully
        // Log password change for security audit (optional)
        logPasswordChange($pdo, $userId);
        
        echo json_encode(["success" => true, "message" => "Password changed successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update password"]);
    }
    
} catch (PDOException $e) {
    // Handle database errors
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error occurred"]);
    
    // Log the error for debugging (do not expose in production)
    error_log('PDO Error: ' . $e->getMessage());
}

// Validate password against security requirements
function validatePassword($password) {
    // Check length
    if (strlen($password) < 8) {
        return false;
    }
    
    // Check for lowercase letter
    if (!preg_match('/[a-z]/', $password)) {
        return false;
    }
    
    // Check for uppercase letter
    if (!preg_match('/[A-Z]/', $password)) {
        return false;
    }
    
    // Check for number
    if (!preg_match('/[0-9]/', $password)) {
        return false;
    }
    
    // Check for special character
    $specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_'];
    $hasSpecialChar = false;
    
    foreach ($specialChars as $char) {
        if (strpos($password, $char) !== false) {
            $hasSpecialChar = true;
            break;
        }
    }
    
    if (!$hasSpecialChar) {
        return false;
    }
    
    // Check for invalid characters
    if (!preg_match('/^[a-zA-Z0-9!@#$%^&*()_\-]+$/', $password)) {
        return false;
    }
    
    return true;
}

// Log password changes for security audit

function logPasswordChange($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("INSERT INTO security_logs (user_id, action, timestamp) VALUES (?, 'password_change', NOW())");
        $stmt->execute([$userId]);
    } catch (Exception $e) {
        // Log error but continue execution
        error_log('Failed to log password change: ' . $e->getMessage());
    }
}
?>