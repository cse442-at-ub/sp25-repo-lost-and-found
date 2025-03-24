<?php
if (!headers_sent()) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json");
}

require_once 'session.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$_SESSION = array();

endSession();

if (isset($_COOKIE['session_id'])) {
    setcookie('session_id', '', time() - 3600, '/');
}

if (isset($_COOKIE['is_admin'])) {
    setcookie('is_admin', '', time() - 3600, '/');
}

session_destroy();

echo json_encode(["success" => true, "message" => "Logged out successfully"]);
exit;
?>