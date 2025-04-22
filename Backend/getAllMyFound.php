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
    // Admin view - get all found items with claims
    $stmt = $pdo->prepare("
        SELECT 
            fi.id,
            fi.item_name AS name,
            fi.image,
            fi.location_found AS location,
            fi.description,
            c.id AS claim_id,
            c.approved,
            c.rejection_reason,
            c.claim_type,
            c.proof_of_ownership,
            c.additional_details,
            c.created_at,
            m.match_id
        FROM found_items fi
        LEFT JOIN claims c ON fi.id = c.item_id
        LEFT JOIN matches m ON fi.id = m.found_item_id
        ORDER BY fi.id DESC
    ");
    $stmt->execute();
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($items);
} else {
    // Regular user view - get their found items with claims and matches
    $stmt = $pdo->prepare("
        SELECT 
            fi.id,
            fi.item_name AS name,
            fi.image,
            fi.location_found AS location,
            fi.description,
            c.id AS claim_id,
            c.approved,
            c.rejection_reason,
            c.claim_type,
            c.proof_of_ownership,
            c.additional_details,
            c.created_at,
            m.match_id
        FROM found_items fi
        LEFT JOIN claims c ON fi.id = c.item_id
        LEFT JOIN matches m ON fi.id = m.found_item_id
        WHERE fi.user_id = ?
        ORDER BY fi.id DESC
    ");
    $stmt->execute([$user_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($items);
}
?>