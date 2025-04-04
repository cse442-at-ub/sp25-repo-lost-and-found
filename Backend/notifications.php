<?php
/**
 * Notifications API Endpoint
 * 
 * Handles requests for fetching, marking as read, and deleting notifications.
 */

// Start session and require necessary files
require_once 'db.php';
require_once 'session.php';
require_once 'notification_service.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get user ID from session
session_start();
$userId = $_SESSION['user_id'] ?? null;

// Check if user is authenticated
if (!$userId) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'User not authenticated']);
    exit();
}

// Initialize notification service
$notificationService = new NotificationService();

// Handle different request methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        handleGetRequest($notificationService, $userId);
        break;
    case 'POST':
        handlePostRequest($notificationService, $userId);
        break;
    case 'DELETE':
        handleDeleteRequest($notificationService, $userId);
        break;
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

/**
 * Handle GET requests
 * 
 * @param NotificationService $notificationService The notification service
 * @param int $userId The ID of the user
 */
function handleGetRequest($notificationService, $userId) {
    // Check for specific notification request
    if (isset($_GET['id'])) {
        $notificationId = (int)$_GET['id'];
        $notification = $notificationService->getNotification($notificationId, $userId);
        
        if ($notification) {
            // Mark as read if requested
            if (isset($_GET['mark_read']) && $_GET['mark_read'] === 'true') {
                $notificationService->markAsRead($notificationId, $userId);
                $notification['is_read'] = 1;
            }
            echo json_encode([
                'success' => true,
                'notification' => $notification
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Notification not found']);
        }
        return;
    }

    // Get all notifications with optional filtering
    $unreadOnly = isset($_GET['unread']) && $_GET['unread'] === 'true';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    $notifications = $notificationService->getNotifications($userId, $unreadOnly, $limit, $offset);
    $unreadCount = $notificationService->getUnreadCount($userId);
    
    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unread_count' => $unreadCount,
        'total' => count($notifications)
    ]);
}

/**
 * Handle POST requests
 * 
 * @param NotificationService $notificationService The notification service
 * @param int $userId The ID of the user
 */
function handlePostRequest($notificationService, $userId) {
    // Get JSON data from the request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Mark all as read
    if (isset($data['mark_all_read']) && $data['mark_all_read'] === true) {
        $success = $notificationService->markAllAsRead($userId);
        echo json_encode([
            'success' => $success,
            'message' => $success ? 'All notifications marked as read' : 'Failed to mark all notifications as read'
        ]);
        return;
    }
    
    // Mark a specific notification as read
    if (isset($data['mark_read']) && isset($data['notification_id'])) {
        $notificationId = (int)$data['notification_id'];
        $success = $notificationService->markAsRead($notificationId, $userId);
        echo json_encode([
            'success' => $success,
            'message' => $success ? 'Notification marked as read' : 'Failed to mark notification as read'
        ]);
        return;
    }
    
    // Create a new notification (for testing or admin purposes)
    if (isset($data['create']) && $data['create'] === true) {
        // Check if user is admin for this functionality
        validateSession(true);
        
        $targetUserId = $data['user_id'] ?? $userId;
        $title = $data['title'] ?? 'New Notification';
        $message = $data['message'] ?? 'You have a new notification';
        $type = $data['type'] ?? 'info';
        $link = $data['link'] ?? null;
        $details = $data['details'] ?? null;
        
        $notificationId = $notificationService->createNotification(
            $targetUserId, $title, $message, $type, $link, $details
        );
        
        if ($notificationId) {
            echo json_encode([
                'success' => true,
                'notification_id' => $notificationId,
                'message' => 'Notification created successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create notification'
            ]);
        }
        return;
    }
    
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
}

/**
 * Handle DELETE requests
 * 
 * @param NotificationService $notificationService The notification service
 * @param int $userId The ID of the user
 */
function handleDeleteRequest($notificationService, $userId) {
    // Get JSON data from the request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Delete all read notifications
    if (isset($data['delete_read']) && $data['delete_read'] === true) {
        $success = $notificationService->deleteReadNotifications($userId);
        echo json_encode([
            'success' => $success,
            'message' => $success ? 'All read notifications deleted' : 'Failed to delete read notifications'
        ]);
        return;
    }
    
    // Delete a specific notification
    if (isset($data['notification_id'])) {
        $notificationId = (int)$data['notification_id'];
        $success = $notificationService->deleteNotification($notificationId, $userId);
        echo json_encode([
            'success' => $success,
            'message' => $success ? 'Notification deleted' : 'Failed to delete notification'
        ]);
        return;
    }
    
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
}
?>