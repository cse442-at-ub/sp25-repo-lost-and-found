<?php

// Database configuration
require_once 'db.php';
require_once 'session.php';
validateSession(true);

try {
  // Establish PDO connection
  $pdo = getDbConnection();

  header('Content-Type: application/json');

  // Check if it's a GET request
  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT id,username,name,email,message,created_at FROM messages
        ORDER BY created_at ASC");
    $stmt->execute();
    $rows = [];
    while (($row = $stmt->fetch(PDO::FETCH_ASSOC))) {
      $rows[] = $row;
    }
    echo json_encode(["okay" => true, "rows" => $rows]);
  } else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $json = json_decode(file_get_contents('php://input'), true);
    $deleted = [];
    foreach ($json['selected'] as $id) {
      $stmt = $pdo->prepare("DELETE FROM messages WHERE id=:id");
      $stmt->bindValue(':id', $id, PDO::PARAM_INT);
      $stmt->execute();
      if ($stmt->rowCount() > 0)
        $deleted[] = $id;
    }
    echo json_encode(["okay" => !empty($deleted), "deleted" => $deleted]);
  } else {
    echo '{"okay": false, "msg": "Method not allowed"}';
  }
} catch (PDOException $e) {
  // Handle database errors
  http_response_code(500); // Internal Server Error
  echo "Database error: " . $e->getMessage();
}
?>