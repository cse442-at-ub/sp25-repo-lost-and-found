<?php

require_once 'db.php';
require_once 'session.php';

$user_id = validateSessionAndFindUser(false);
$pdo = getDbConnection();
$stmt = $pdo->prepare("
  SELECT
    found_items.id AS id,
    found_items.item_name AS name,
    found_items.image AS image,
    found_items.location_found AS location,
    found_items.description AS description,
    claims.id AS claim_id,
    claims.approved AS approved,
    claims.rejection_reason AS rejection_reason,
    matches.match_id AS match_id
  FROM found_items
  LEFT JOIN claims ON found_items.id=claims.item_id
  LEFT JOIN matches ON found_items.id=matches.found_item_id
  WHERE found_items.user_id=?
");
$stmt->execute([$user_id]);
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($result);
?>