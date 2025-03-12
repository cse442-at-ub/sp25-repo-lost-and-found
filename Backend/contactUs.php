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

    if (isset($data['username']) && isset($data['name']) && isset($data['email']) && isset($data['message'])) {
      $stmt = $pdo->prepare("INSERT INTO messages (username,name,email,message)
          VALUES (:username,:name,:email,:message)");
      $stmt->bindValue(':username', $data['username']);
      $stmt->bindValue(':name', $data['name']);
      $stmt->bindValue(':email', $data['email']);
      $stmt->bindValue(':message', $data['message']);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        echo '{"okay": true, "msg": "Your message is received!"}';
      } else {
        echo '{"okay": false, "msg": "Failed to save your message! Please try other ways."}';
      }
    } else {
      echo '{"okay": false, "msg": "Missing field(s)"}';
    }
  } else {
    echo '{"okay": false, "msg": "Method not allowed"}';
  }
} catch (PDOException $e) {
  // Handle database errors
  http_response_code(500); // Internal Server Error
  echo "Database error: " . $e->getMessage();
}
?>