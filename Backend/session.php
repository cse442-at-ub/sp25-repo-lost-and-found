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
}

// Function to start a session
function endSession() {
  if (isset($_COOKIE['session_id'])) {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("DELETE FROM sessions WHERE session_id = ?");
    $stmt->execute([$sessionId]);

    setcookie('session_id', "", 0, '/', '', false, true);
    setcookie('is_admin', "", 0, '/', '', false, false);
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

  // Refresh the session timeout
  $stmt = $pdo->prepare("UPDATE sessions SET created_at = NOW() WHERE session_id = ?");
  $stmt->execute([$sessionId]);
  setcookie('session_id', $sessionId, time() + $sessionTimeout, '/');

  return $isAdmin;
}

// Example usage (inside a protected page)
// include 'session_manager.php';
// validateSession(true); // Require admin session
// echo "Admin page content";

//Example usage (inside a regular page)
//include 'session_manager.php';
//validateSession(false); // require any session
//echo "Regular page content";

//Example usage (for login)
//include 'session_manager.php';
//startSession(true); //start an admin session
//echo "logged in as admin";

//Example usage (for login)
//include 'session_manager.php';
//startSession(false); //start a regular session
//echo "logged in as user";

?>