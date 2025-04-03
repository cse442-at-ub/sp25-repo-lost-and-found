<?php
/**
 * Notification Service
 * 
 * This service provides functions to create, read, update, and delete notifications.
 * It can be imported into other modules to trigger notifications.
 */

// Require database connection
require_once 'db.php';

class NotificationService {
    private $pdo;

    /**
     * Constructor
     */
    public function __construct() {
        $this->pdo = getDbConnection();
    }

    /**
     * Create a new notification
     * 
     * @param int $userId The ID of the user to send the notification to
     * @param string $title The notification title
     * @param string $message The notification message
     * @param string $type The notification type (success, warning, info, error)
     * @param string|null $link Optional link associated with the notification
     * @param string|null $details Optional detailed information
     * @return int|false The ID of the new notification or false on failure
     */
    public function createNotification($userId, $title, $message, $type = 'info', $link = null, $details = null) {
        try {
            $stmt = $this->pdo->prepare(
                "INSERT INTO notification_system (user_id, title, message, type, link, details) 
                 VALUES (:user_id, :title, :message, :type, :link, :details)"
            );
            
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title, PDO::PARAM_STR);
            $stmt->bindParam(':message', $message, PDO::PARAM_STR);
            $stmt->bindParam(':type', $type, PDO::PARAM_STR);
            $stmt->bindParam(':link', $link, PDO::PARAM_STR);
            $stmt->bindParam(':details', $details, PDO::PARAM_STR);
            
            $stmt->execute();
            return $this->pdo->lastInsertId();
        } catch (PDOException $e) {
            error_log("Failed to create notification: " . $e->getMessage());
            error_log("SQL State: " . $e->getCode());
            error_log("For user: $userId, title: $title");
            return false;
        }
    }

    /**
     * Get all notifications for a user
     * 
     * @param int $userId The ID of the user
     * @param bool $unreadOnly Whether to return only unread notifications
     * @param int $limit Optional limit on the number of notifications to return
     * @param int $offset Optional offset for pagination
     * @return array The notifications
     */
    public function getNotifications($userId, $unreadOnly = false, $limit = 50, $offset = 0) {
        try {
            $sql = "SELECT * FROM notification_system WHERE user_id = :user_id";
            
            if ($unreadOnly) {
                $sql .= " AND is_read = 0";
            }
            
            $sql .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Failed to get notifications: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get a single notification by ID
     * 
     * @param int $notificationId The ID of the notification
     * @param int $userId The ID of the user (for security)
     * @return array|false The notification or false if not found
     */
    public function getNotification($notificationId, $userId) {
        try {
            $stmt = $this->pdo->prepare(
                "SELECT * FROM notification_system 
                 WHERE id = :id AND user_id = :user_id"
            );
            
            $stmt->bindParam(':id', $notificationId, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Failed to get notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Mark a notification as read
     * 
     * @param int $notificationId The ID of the notification
     * @param int $userId The ID of the user (for security)
     * @return bool Whether the operation was successful
     */
    public function markAsRead($notificationId, $userId) {
        try {
            $stmt = $this->pdo->prepare(
                "UPDATE notification_system 
                 SET is_read = 1 
                 WHERE id = :id AND user_id = :user_id"
            );
            
            $stmt->bindParam(':id', $notificationId, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Failed to mark notification as read: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Mark all notifications as read for a user
     * 
     * @param int $userId The ID of the user
     * @return bool Whether the operation was successful
     */
    public function markAllAsRead($userId) {
        try {
            $stmt = $this->pdo->prepare(
                "UPDATE notification_system 
                 SET is_read = 1 
                 WHERE user_id = :user_id"
            );
            
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            return true;
        } catch (PDOException $e) {
            error_log("Failed to mark all notifications as read: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a notification
     * 
     * @param int $notificationId The ID of the notification
     * @param int $userId The ID of the user (for security)
     * @return bool Whether the operation was successful
     */
    public function deleteNotification($notificationId, $userId) {
        try {
            $stmt = $this->pdo->prepare(
                "DELETE from notification_system 
                 WHERE id = :id AND user_id = :user_id"
            );
            
            $stmt->bindParam(':id', $notificationId, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Failed to delete notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete all read notifications for a user
     * 
     * @param int $userId The ID of the user
     * @return bool Whether the operation was successful
     */
    public function deleteReadNotifications($userId) {
        try {
            $stmt = $this->pdo->prepare(
                "DELETE FROM notification_system 
                 WHERE user_id = :user_id AND is_read = 1"
            );
            
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            return true;
        } catch (PDOException $e) {
            error_log("Failed to delete read notifications: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get the count of unread notifications for a user
     * 
     * @param int $userId The ID of the user
     * @return int The count of unread notifications
     */
    public function getUnreadCount($userId) {
        try {
            $stmt = $this->pdo->prepare(
                "SELECT COUNT(*) FROM notification_system 
                 WHERE user_id = :user_id AND is_read = 0"
            );
            
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            return (int)$stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("Failed to get unread notification count: " . $e->getMessage());
            return 0;
        }
    }
}
?>