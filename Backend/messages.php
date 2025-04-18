<?php

// Database configuration
require_once 'db.php';
require_once 'session.php';
validateSession(true);

try {
  // Establish PDO connection
  $pdo = getDbConnection();

  header('Content-Type: application/json');

  // Check request method
  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // GET request - fetch messages
    $stmt = $pdo->prepare("SELECT id, username, name, email, message, created_at, is_read FROM messages
        ORDER BY created_at DESC");
    $stmt->execute();
    $rows = [];
    while (($row = $stmt->fetch(PDO::FETCH_ASSOC))) {
      $rows[] = $row;
    }
    echo json_encode(["okay" => true, "rows" => $rows]);
  } 
  else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // DELETE request - delete selected messages
    $json = json_decode(file_get_contents('php://input'), true);
    $deleted = [];
    foreach ($json['selected'] as $id) {
      $stmt = $pdo->prepare("DELETE FROM messages WHERE id = :id");
      $stmt->bindValue(':id', $id, PDO::PARAM_INT);
      $stmt->execute();
      if ($stmt->rowCount() > 0)
        $deleted[] = $id;
    }
    echo json_encode(["okay" => !empty($deleted), "deleted" => $deleted]);
  } 
  else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // POST request - handle mark as read
    $json = json_decode(file_get_contents('php://input'), true);
    
    // Check if this is a "mark as read" request
    if (isset($json['action']) && $json['action'] === 'mark_read' && isset($json['message_id'])) {
      $messageId = $json['message_id'];
      
      // Update the message to mark it as read
      $stmt = $pdo->prepare("UPDATE messages SET is_read = 1 WHERE id = :id");
      $stmt->bindValue(':id', $messageId, PDO::PARAM_INT);
      $stmt->execute();
      
      // Check if the update was successful
      if ($stmt->rowCount() > 0) {
        echo json_encode(["okay" => true, "message" => "Message marked as read"]);
      } else {
        echo json_encode(["okay" => false, "message" => "Failed to mark message as read"]);
      }
    } else {
      echo json_encode(["okay" => false, "message" => "Invalid request"]);
    }
  } 
  else {
    echo json_encode(["okay" => false, "message" => "Method not allowed"]);
  }
} catch (PDOException $e) {
  // Handle database errors
  http_response_code(500); // Internal Server Error
  echo json_encode(["okay" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>