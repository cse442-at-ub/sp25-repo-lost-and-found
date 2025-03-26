<?php
// Database configuration
require_once 'db.php';

// Session timeout (15 minutes)
$sessionTimeout = 15 * 60;

// Function to generate a random session ID
function _generateSessionId() {
  return bin2hex(random_bytes(32));
}

// Function to start a session
function startSession($isAdmin = false) {
  global $sessionTimeout;

  $sessionId = _generateSessionId();
  $isAdminInt = $isAdmin ? 1 : 0; // Convert boolean to integer

  $pdo = getDbConnection();
  $stmt = $pdo->prepare("INSERT INTO sessions (session_id, is_admin) VALUES (?, ?)");
  $stmt->execute([$sessionId, $isAdminInt]);

  setcookie('session_id', $sessionId, time() + $sessionTimeout, '/', '', false, true);
  // help frontend to identify whether the user is admin, thus should not be HTTPOnly
  setcookie('is_admin', $isAdmin? "true":"false", time() + $sessionTimeout, '/', '', false, false);
  // Add a UI-specific cookie that can be read by JavaScript
  setcookie('user_logged_in', 'true', time() + $sessionTimeout, '/', '', false, false);
}

// Function to end a session
function endSession() {
  if (isset($_COOKIE['session_id'])) {
    $sessionId = $_COOKIE['session_id']; 
    
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("DELETE FROM sessions WHERE session_id = ?");
    $stmt->execute([$sessionId]);

    // Use consistent expiration time format (time() - 3600)
    setcookie('session_id', "", time() - 3600, '/', '', false, true);
    setcookie('is_admin', "", time() - 3600, '/', '', false, false);
    setcookie('user_logged_in', "", time() - 3600, '/', '', false, false);
  }
}

// Function to validate a session
function validateSession($shouldBeAdmin = false) {
  global $sessionTimeout;

  if (!isset($_COOKIE['session_id'])) {
    http_response_code(401); // Unauthorized
    exit("Session not found.");
  }

  $sessionId = $_COOKIE['session_id'];

  $pdo = getDbConnection();
  $stmt = $pdo->prepare("SELECT is_admin, created_at FROM sessions WHERE session_id = ?");
  $stmt->execute([$sessionId]);
  $result = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$result) {
    http_response_code(401); // Unauthorized
    exit("Invalid session.");
  }

  $isAdmin = $result['is_admin'] == 1;
  $createdAt = strtotime($result['created_at']);
  $currentTime = time();

  if ($currentTime - $createdAt > $sessionTimeout) {
    // Session expired, delete the session from the database
    $stmt = $pdo->prepare("DELETE FROM sessions WHERE session_id = ?");
    $stmt->execute([$sessionId]);

    http_response_code(401); // Unauthorized
    exit("Session expired.");
  }
  if($shouldBeAdmin && !$isAdmin){
    http_response_code(403); // Forbidden
    exit("Admin session required.");
  }

  // Refresh the session timeout - use consistent parameters for all cookies
  $stmt = $pdo->prepare("UPDATE sessions SET created_at = NOW() WHERE session_id = ?");
  $stmt->execute([$sessionId]);
  
  // Fixed: Use consistent parameters for all cookies
  setcookie('session_id', $sessionId, time() + $sessionTimeout, '/', '', false, true);
  setcookie('is_admin', $isAdmin? "true":"false", time() + $sessionTimeout, '/', '', false, false);
  setcookie('user_logged_in', 'true', time() + $sessionTimeout, '/', '', false, false);
  
  return $isAdmin;
}
?>