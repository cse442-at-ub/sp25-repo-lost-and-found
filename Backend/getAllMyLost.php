<?php

require_once 'db.php';
require_once 'session.php';

$user_id = validateSessionAndFindUser(false);
$pdo = getDbConnection();

// Check if user is admin
$stmt = $pdo->prepare("SELECT is_admin FROM users WHERE user_id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user['is_admin']) {
    // Admin view - get all lost items
    $stmt = $pdo->prepare("
        SELECT 
            li.id,
            li.name,
            li.file_path AS image,
            li.last_seen_location AS location,
            li.description,
            m.match_id,
            c.id AS claim_id,
            c.approved,
            c.rejection_reason,
            c.claim_type,
            c.proof_of_ownership,
            c.additional_details,
            c.created_at
        FROM lost_items li
        LEFT JOIN matches m ON li.id = m.lost_item_id
        LEFT JOIN found_items fi ON m.found_item_id = fi.id
        LEFT JOIN claims c ON fi.id = c.item_id
        ORDER BY li.id DESC
    ");
    $stmt->execute();
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($items);
} else {
    // Regular user view - get their lost items with matches and claims
    $stmt = $pdo->prepare("
        SELECT 
            li.id,
            li.name,
            li.file_path AS image,
            li.last_seen_location AS location,
            li.description,
            m.match_id,
            c.id AS claim_id,
            c.approved,
            c.rejection_reason,
            c.claim_type,
            c.proof_of_ownership,
            c.additional_details,
            c.created_at
        FROM lost_items li
        LEFT JOIN matches m ON li.id = m.lost_item_id
        LEFT JOIN found_items fi ON m.found_item_id = fi.id
        LEFT JOIN claims c ON fi.id = c.item_id
        WHERE li.user_id = ?
        ORDER BY li.id DESC
    ");
    $stmt->execute([$user_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($items);
}
?>