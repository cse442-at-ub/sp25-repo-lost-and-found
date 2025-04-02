<?php
/**
 * Notification Helper
 * 
 * This file provides helper functions for triggering notifications from various parts of the application.
 * Import this file to quickly create notifications for different events.
 */

require_once 'notification_service.php';

/**
 * Create a notification for a user
 * 
 * @param int $userId The ID of the user
 * @param string $title The notification title
 * @param string $message The notification message
 * @param string $type The notification type (success, warning, info, error)
 * @param string|null $link Optional link associated with the notification
 * @param string|null $details Optional detailed information
 * @return int|false The ID of the new notification or false on failure
 */
function createNotification($userId, $title, $message, $type = 'info', $link = null, $details = null) {
    $notificationService = new NotificationService();
    return $notificationService->createNotification($userId, $title, $message, $type, $link, $details);
}

/**
 * Create a notification for a lost item match
 * 
 * @param int $userId The ID of the user
 * @param string $itemName The name of the item
 * @param int $itemId The ID of the item
 * @return int|false The ID of the new notification or false on failure
 */
function notifyLostItemMatch($userId, $itemName, $itemId) {
    $title = 'Item Match Found';
    $message = "A $itemName matching your lost item description has been found.";
    $link = "/claim?item=$itemId";
    $details = "We've found an item that matches your lost item description. Please check the claim page for more details and to verify ownership.";
    
    return createNotification($userId, $title, $message, 'success', $link, $details);
}

/**
 * Create a notification for a found item match
 * 
 * @param int $userId The ID of the user
 * @param string $itemName The name of the item
 * @param int $itemId The ID of the item
 * @return int|false The ID of the new notification or false on failure
 */
function notifyFoundItemMatch($userId, $itemName, $itemId) {
    $title = 'Item Match Found';
    $message = "Someone has reported losing a $itemName that matches an item you found.";
    $link = "/matches?item=$itemId";
    $details = "Someone has reported losing an item that matches the description of an item you found. Please check the matches page for more details.";
    
    return createNotification($userId, $title, $message, 'success', $link, $details);
}

/**
 * Create a notification for a claim approval
 * 
 * @param int $userId The ID of the user
 * @param string $itemName The name of the item
 * @param int $claimId The ID of the claim
 * @return int|false The ID of the new notification or false on failure
 */
function notifyClaimApproved($userId, $itemName, $claimId) {
    $title = 'Claim Request Approved';
    $message = "Your claim request for the $itemName has been approved.";
    $link = "/claim-details?id=$claimId";
    $details = "Your claim request has been approved. Please visit the office to collect your item. Bring your ID and the claim confirmation.";
    
    return createNotification($userId, $title, $message, 'success', $link, $details);
}

/**
 * Create a notification for a claim denial
 * 
 * @param int $userId The ID of the user
 * @param string $itemName The name of the item
 * @param int $claimId The ID of the claim
 * @param string|null $reason Optional reason for denial
 * @return int|false The ID of the new notification or false on failure
 */
function notifyClaimDenied($userId, $itemName, $claimId, $reason = null) {
    $title = 'Claim Request Denied';
    $message = "Your claim request for the $itemName has been denied.";
    $link = "/claim-details?id=$claimId";
    $details = "Your claim request has been denied.";
    
    if ($reason) {
        $details .= " Reason: $reason";
    }
    
    return createNotification($userId, $title, $message, 'warning', $link, $details);
}

/**
 * Create a notification requesting additional information
 * 
 * @param int $userId The ID of the user
 * @param string $itemName The name of the item
 * @param int $itemId The ID of the item
 * @param string $requestType The type of request (e.g., 'lost', 'found')
 * @param string $additionalInfo What information is needed
 * @return int|false The ID of the new notification or false on failure
 */
function notifyAdditionalInfoNeeded($userId, $itemName, $itemId, $requestType, $additionalInfo) {
    $reportType = $requestType === 'lost' ? 'lost' : 'found';
    $link = "/report-$reportType-item?edit=$itemId";
    
    $title = 'Additional Information Needed';
    $message = "We need more information about your $reportType $itemName.";
    $details = "Please update your report with the following information: $additionalInfo";
    
    return createNotification($userId, $title, $message, 'warning', $link, $details);
}

/**
 * Create a notification for account security events
 * 
 * @param int $userId The ID of the user
 * @param string $event The security event (e.g., 'password_changed', 'login_attempt')
 * @param array $eventDetails Details about the event
 * @return int|false The ID of the new notification or false on failure
 */
function notifySecurityEvent($userId, $event, $eventDetails = []) {
    $title = 'Account Security Alert';
    $link = '/settings';
    $type = 'warning';
    
    switch ($event) {
        case 'password_changed':
            $message = 'Your password was changed successfully.';
            $details = 'Your account password was changed. If you did not make this change, please contact support immediately.';
            break;
        case 'login_attempt':
            $ipAddress = $eventDetails['ip_address'] ?? 'Unknown';
            $location = $eventDetails['location'] ?? 'Unknown location';
            $time = $eventDetails['time'] ?? 'recently';
            
            $message = "Unusual login attempt detected from $location.";
            $details = "There was a login attempt to your account from IP: $ipAddress, Location: $location, Time: $time. If this was not you, please secure your account immediately.";
            break;
        default:
            $message = 'Account security alert.';
            $details = 'There was a security event related to your account. Please check your account settings.';
    }
    
    return createNotification($userId, $title, $message, $type, $link, $details);
}

/**
 * Create a notification for system announcements
 * 
 * @param int $userId The ID of the user
 * @param string $title The announcement title
 * @param string $message The announcement message
 * @param string|null $link Optional link for more information
 * @return int|false The ID of the new notification or false on failure
 */
function notifySystemAnnouncement($userId, $title, $message, $link = null) {
    return createNotification($userId, $title, $message, 'info', $link);
}
?>