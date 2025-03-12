<?php
// Database configuration
$host = 'localhost'; // e.g., localhost
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'jxboulwa';
$password = '50456062';

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

    if (isset($data['email'])) {
      $email = $data['email'];
    } else {
      echo '{"okay": false, "msg": "Email required"}';
      return;
    }

    if (isset($data['password'])) {
      $password = $data['password'];
    } else {
      echo '{"okay": false, "msg": "Password required"}';
      return;
    }
    
    if (strlen($password) >= 8
        && preg_match('/[a-z]/', $password)
        && preg_match('/[A-Z]/', $password)
        && preg_match('/[0-9]/', $password)
        && preg_match('/[!@#$%^&()\-_=]/', $password)
        && !preg_match('/[^a-zA-Z0-9!@#$%^&()\-_=]/', $password)) {
      // strong password
    } else {
      echo '{"okay": false, "msg": "Password too weak"}';
      return;
    }

    $stmt = $pdo->prepare('UPDATE users SET password = :password
        WHERE email = :email');
    $stmt->bindValue(':email', $email, PDO::PARAM_STR);
    $stmt->bindValue(':password', password_hash($password, PASSWORD_BCRYPT), PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      echo '{"okay": true, "msg": "Password updated"}';
    } else {
      echo '{"okay": false, "msg": "Failed to update password"}';
    }
  }
} catch (PDOException $e) {
  // Handle database errors
  http_response_code(500); // Internal Server Error
  echo "Database error: " . $e->getMessage();
}
?>