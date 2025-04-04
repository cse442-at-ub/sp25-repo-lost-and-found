<?php
// Database configuration
require_once 'session.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

// Check if there's an active session
if (isset($_COOKIE['session_id'])) {
    try {
        // This will validate the session and exit with proper status codes if invalid
        $isAdmin = validateSession(false);
        
        // If we reached here, session is valid
        echo json_encode([
            "authenticated" => true,
            "isAdmin" => $isAdmin
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "authenticated" => false,
            "message" => "Session validation error"
        ]);
    }
} else {
    echo json_encode([
        "authenticated" => false,
        "message" => "No active session"
    ]);
}
?>