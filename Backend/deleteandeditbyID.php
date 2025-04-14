<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'db.php';
require_once 'session.php';

$user_id = validateSessionAndFindUser(false);
$pdo = getDbConnection();

$type = $_POST['type'] ?? '';
$action = $_POST['action'] ?? '';
$id = $_POST['id'] ?? null;

if (!$id || !in_array($type, ['found', 'lost'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}

$table = $type === 'found' ? 'found_items' : 'lost_items';

// Handle delete action
if ($action === 'delete') {
    $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
    $success = $stmt->execute([$id]);
    echo json_encode(['success' => $success]);
    exit;
}

// Handle edit action
if ($action === 'edit') {
    // Collect form fields
    $name = $_POST['name'] ?? '';
    $location = $_POST['last_seen_location'] ?? '';
    $description = $_POST['description'] ?? '';
    $phone = $_POST['phone_number'] ?? '';
    $email = $_POST['email_address'] ?? '';
    $first = $_POST['first_name'] ?? '';
    $last = $_POST['last_name'] ?? '';
    $filePath = null;

    // Handle image upload if provided
    if (!empty($_FILES['file_path']['name'])) {
        $uploadDir = 'uploads/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filename = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "_", $_FILES['file_path']['name']);
        $destination = $uploadDir . $filename;

        if (move_uploaded_file($_FILES['file_path']['tmp_name'], $destination)) {
            $filePath = $destination;
        } else {
            echo json_encode(['success' => false, 'error' => 'File upload failed']);
            exit;
        }
    }

    // Build update query
    $query = "UPDATE $table SET name = ?, last_seen_location = ?, description = ?, phone_number = ?, email_address = ?, first_name = ?, last_name = ?";
    $params = [$name, $location, $description, $phone, $email, $first, $last];

    if ($filePath !== null) {
        $query .= ", file_path = ?";
        $params[] = $filePath;
    }

    $query .= " WHERE id = ?";
    $params[] = $id;

    // Run update
    $stmt = $pdo->prepare($query);
    $success = $stmt->execute($params);

    echo json_encode(['success' => $success]);
    exit;
}

// If neither delete nor edit action
echo json_encode(['success' => false, 'error' => 'Invalid action']);
?>