import { useState } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  link?: string;
  details?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  unread_count: number;
  total: number;
}

export interface SingleNotificationResponse {
  success: boolean;
  notification: Notification;
}

export interface ActionResponse {
  success: boolean;
  message: string;
}

const API_URL = './Backend/notifications.php';

/**
 * Get all notifications
 * 
 * @param unreadOnly Whether to get only unread notifications
 * @param limit The maximum number of notifications to fetch
 * @param offset The offset for pagination
 * @returns A promise resolving to the notification response
 */
export const getNotifications = async (
  unreadOnly: boolean = false,
  limit: number = 50,
  offset: number = 0
): Promise<NotificationResponse> => {
  try {
    const queryParams = new URLSearchParams({
      unread: unreadOnly.toString(),
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'include', // Important to include cookies
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      success: false,
      notifications: [],
      unread_count: 0,
      total: 0,
    };
  }
};

/**
 * Get a specific notification by ID
 * 
 * @param id The ID of the notification
 * @param markAsRead Whether to mark the notification as read
 * @returns A promise resolving to the notification
 */
export const getNotification = async (
  id: string,
  markAsRead: boolean = false
): Promise<SingleNotificationResponse> => {
  try {
    const queryParams = new URLSearchParams({
      id,
      mark_read: markAsRead.toString(),
    });

    const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notification:', error);
    return {
      success: false,
      notification: null,
    };
  }
};

/**
 * Mark a notification as read
 * 
 * @param notificationId The ID of the notification
 * @returns A promise resolving to the action response
 */
export const markAsRead = async (notificationId: string): Promise<ActionResponse> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mark_read: true,
        notification_id: notificationId,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      message: 'Failed to mark notification as read',
    };
  }
};

/**
 * Mark all notifications as read
 * 
 * @returns A promise resolving to the action response
 */
export const markAllAsRead = async (): Promise<ActionResponse> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mark_all_read: true,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return {
      success: false,
      message: 'Failed to mark all notifications as read',
    };
  }
};

/**
 * Delete a notification
 * 
 * @param notificationId The ID of the notification
 * @returns A promise resolving to the action response
 */
export const deleteNotification = async (notificationId: string): Promise<ActionResponse> => {
  try {
    const response = await fetch(API_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification_id: notificationId,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting notification:', error);
    return {
      success: false,
      message: 'Failed to delete notification',
    };
  }
};

/**
 * Delete all read notifications
 * 
 * @returns A promise resolving to the action response
 */
export const deleteReadNotifications = async (): Promise<ActionResponse> => {
  try {
    const response = await fetch(API_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        delete_read: true,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete read notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    return {
      success: false,
      message: 'Failed to delete read notifications',
    };
  }
};

/**
 * Hook for using notifications in React components
 */
export const useNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const fetchNotifications = async (unreadOnly: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getNotifications(unreadOnly);
      
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.unread_count);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      setError('An error occurred while fetching notifications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await markAsRead(notificationId);
      
      if (response.success) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId ? { ...notification, is_read: true } : notification
          )
        );
        setUnreadCount(prev => prev - 1);
      }
      
      return response;
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Failed to mark notification as read' };
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllAsRead();
      
      if (response.success) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, is_read: true }))
        );
        setUnreadCount(0);
      }
      
      return response;
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Failed to mark all notifications as read' };
    }
  };
  
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await deleteNotification(notificationId);
      
      if (response.success) {
        const removedNotification = notifications.find(n => n.id === notificationId);
        
        setNotifications(prevNotifications => 
          prevNotifications.filter(notification => notification.id !== notificationId)
        );
        
        if (removedNotification && !removedNotification.is_read) {
          setUnreadCount(prev => prev - 1);
        }
      }
      
      return response;
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Failed to delete notification' };
    }
  };
  
  const handleDeleteReadNotifications = async () => {
    try {
      const response = await deleteReadNotifications();
      
      if (response.success) {
        setNotifications(prevNotifications => 
          prevNotifications.filter(notification => !notification.is_read)
        );
      }
      
      return response;
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Failed to delete read notifications' };
    }
  };
  
  return {
    loading,
    error,
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    deleteReadNotifications: handleDeleteReadNotifications,
  };
};

export default {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  useNotifications,
};