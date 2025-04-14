<?php

require_once 'db.php';
require_once 'session.php';

$user_id = validateSessionAndFindUser(false);
$pdo = getDbConnection();
$stmt = $pdo->prepare("
  SELECT
    lost_items.id AS id,
    lost_items.name AS name,
    lost_items.file_path AS image,
    lost_items.last_seen_location AS location,
    lost_items.description AS description,
    matches.match_id AS match_id,
    claims.id AS claim_id,
    claims.approved AS approved,
    claims.rejection_reason AS rejection_reason
  FROM lost_items
  LEFT JOIN claims ON lost_items.id=claims.item_id
  LEFT JOIN matches ON lost_items.id=matches.lost_item_id
  WHERE lost_items.user_id=?
");
$stmt->execute([$user_id]);
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($result);
?>