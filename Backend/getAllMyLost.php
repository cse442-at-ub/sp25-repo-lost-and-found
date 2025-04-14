<?php

require_once 'db.php';
require_once 'session.php';

$user_id = validateSessionAndFindUser(false);
$pdo = getDbConnection();

// First query: Lost items with matches
$stmt1 = $pdo->prepare("
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
  LEFT JOIN matches ON lost_items.id = matches.lost_item_id
  LEFT JOIN found_items ON matches.found_item_id = found_items.id
  LEFT JOIN claims ON found_items.id = claims.item_id
  WHERE lost_items.user_id = ?
");
$stmt1->execute([$user_id]);
$lostItemsWithMatches = $stmt1->fetchAll(PDO::FETCH_ASSOC);

// Second query: Lost items potentially linked to found items with claims
$stmt2 = $pdo->prepare("
  SELECT
    lost_items.id AS id,
    lost_items.name AS name,
    lost_items.file_path AS image,
    lost_items.last_seen_location AS location,
    lost_items.description AS description,
    NULL AS match_id,
    claims.id AS claim_id,
    claims.approved AS approved,
    claims.rejection_reason AS rejection_reason
  FROM lost_items
  CROSS JOIN found_items
  INNER JOIN claims ON found_items.id = claims.item_id
  WHERE lost_items.user_id = ?
    AND (lost_items.name = found_items.item_name OR lost_items.last_seen_location = found_items.location_found)
    AND NOT EXISTS (
      SELECT 1
      FROM matches
      WHERE matches.lost_item_id = lost_items.id
    )
");
$stmt2->execute([$user_id]);
$lostItemsWithClaims = $stmt2->fetchAll(PDO::FETCH_ASSOC);

// Combine the results and deduplicate by id
$allItems = array_merge($lostItemsWithMatches, $lostItemsWithClaims);
$uniqueItems = [];
$seenIds = [];
foreach ($allItems as $item) {
  if (!in_array($item['id'], $seenIds)) {
    $uniqueItems[] = $item;
    $seenIds[] = $item['id'];
  }
}

// Log the results for debugging
error_log('Lost Items: ' . print_r($uniqueItems, true));

echo json_encode($uniqueItems);
?>