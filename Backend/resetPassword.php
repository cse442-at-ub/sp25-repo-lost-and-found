<?php
// Database configuration
require_once 'db.php';

try {
  // Establish PDO connection
  $pdo = getDbConnection();

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

    if (isset($data['otp'])) {
      $otp = $data['otp'];
    } else {
      echo '{"okay": false, "msg": "OTP Token required"}';
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

    $stmt = $pdo->prepare('SELECT id, token FROM otp_tokens
        WHERE email = :email and used = FALSE
        and created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)');
    $stmt->bindValue(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    while (false !== ($row = $stmt->fetch())) {
      if (password_verify($otp, $row['token'])) {
        $stmt = $pdo->prepare('UPDATE otp_tokens SET used = TRUE
            WHERE id = :id');
        $stmt->bindValue(':id', $row['id'], PDO::PARAM_INT);
        $stmt->execute();

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
        return;
      }
    }
    echo '{"okay": false, "msg": "Invalid email or OTP token"}';
  }
} catch (PDOException $e) {
  // Handle database errors
  http_response_code(500); // Internal Server Error
  echo "Database error: " . $e->getMessage();
}
?>