<?php
require 'db.php';
require_once 'session.php';

$user_id = validateSessionAndFindUser(false);
$pdo = getDbConnection();

$id = $_GET['id'] ?? null;

if (!$id) {
  echo json_encode(null);
  exit;
}

$stmt = $pdo->prepare("SELECT id, name, last_seen_location, description, phone_number, email_address, first_name, last_name, file_path FROM lost_items WHERE id = ?");
$stmt->execute([$id]);
$data = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode($data);
?>
