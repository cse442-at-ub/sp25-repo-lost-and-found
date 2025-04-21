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
    // Admin view - get all claims with found items
    $stmt = $pdo->prepare("
        SELECT 
            c.id AS claim_id,
            c.user_id,
            c.item_id,
            c.claim_type,
            c.proof_of_ownership,
            c.additional_details,
            c.approved,
            c.rejection_reason,
            c.created_at,
            fi.item_name AS name,
            fi.category,
            fi.location_found AS location,
            fi.description,
            fi.image AS file_path
        FROM claims c
        JOIN found_items fi ON c.item_id = fi.id
        ORDER BY c.created_at DESC
    ");
    $stmt->execute();
    $claims = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response to match the existing structure
    $formattedClaims = array_map(function($claim) {
        return [
            'id' => $claim['item_id'],
            'name' => $claim['name'],
            'image' => $claim['file_path'],
            'location' => $claim['location'],
            'description' => $claim['description'],
            'match_id' => null,
            'claim_id' => $claim['claim_id'],
            'approved' => $claim['approved'],
            'rejection_reason' => $claim['rejection_reason'],
            'claim_type' => $claim['claim_type'],
            'proof_of_ownership' => $claim['proof_of_ownership'],
            'additional_details' => $claim['additional_details'],
            'created_at' => $claim['created_at']
        ];
    }, $claims);
    
    echo json_encode($formattedClaims);
} else {
    // Regular user view - get their lost items with matches and claims
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
}
?>