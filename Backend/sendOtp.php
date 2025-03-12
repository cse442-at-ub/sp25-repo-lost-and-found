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

    // Check if email is provided
    if (isset($data['email'])) {
      $email = $data['email'];

      // Prepare and execute the SQL query
      $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
      $stmt->execute([$email]);
      $count = $stmt->fetchColumn();

      if ($count > 0) {
        echo sprintf('{"okay": true}', $otp);
      } else {
        echo '{"okay": false, "msg": "Email not found"}';
      }
    } else {
      echo '{"okay": false, "msg": "Email required"}';
    }
  } else {
    echo '{"okay": false, "msg": "Email not allowed"}';
  }
} catch (PDOException $e) {
  // Handle database errors
  http_response_code(500); // Internal Server Error
  echo "Database error: " . $e->getMessage();
}
?>