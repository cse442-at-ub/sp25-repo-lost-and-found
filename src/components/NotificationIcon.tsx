import React, { useState, useEffect } from 'react';
import { 
  Badge,
  IconButton, 
  Menu, 
  MenuItem, 
  Tooltip, 
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import { Notifications, NotificationsOff } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthContext';
import { useNotifications, Notification } from './NotificationService';

const NotificationIcon: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [enabled, setEnabled] = useState<boolean>(true);
  
  // Use our custom notifications hook
  const { 
    loading, 
    notifications, 
    unreadCount, 
    fetchNotifications,
    markAsRead,
    deleteNotification
  } = useNotifications();

  // Load notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Set up polling every minute to check for new notifications
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated]);

  // Check notification settings
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const storedSettings = localStorage.getItem('notifications');
        if (storedSettings) {
          const settings = JSON.parse(storedSettings);
          const isEnabled = settings.email || settings.sms || settings.push;
          setEnabled(isEnabled);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
      
      const handleSettingsChange = () => {
        try {
          const storedSettings = localStorage.getItem('notifications');
          if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            const isEnabled = settings.email || settings.sms || settings.push;
            setEnabled(isEnabled);
          }
        } catch (error) {
          console.error('Error loading notification settings:', error);
        }
      };
      
      window.addEventListener('notificationSettingsChanged', handleSettingsChange);
      
      return () => {
        window.removeEventListener('notificationSettingsChanged', handleSettingsChange);
      };
    }
  }, [isAuthenticated]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // Fetch fresh notifications when opening the menu
    fetchNotifications();
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if it's not already read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    handleCloseMenu();
    
    // Navigate based on the notification link
    if (notification.link) {
      navigate(notification.link);
    } else {
      navigate(`/notification-detail/${notification.id}`);
    }
  };

  const handleDeleteNotification = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteNotification(id);
  };

  const handleViewAllNotifications = () => {
    handleCloseMenu();
    navigate('/notifications');
  };
  
  // Only render the notification icon if user is logged in
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Tooltip title={enabled ? "Notifications" : "Notifications Disabled"}>
        <IconButton
          onClick={handleOpenMenu}
          color="inherit"
          size="large"
        >
          <Badge badgeContent={enabled ? unreadCount : 0} color="error">
            {enabled ? <Notifications /> : <NotificationsOff />}
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Typography sx={{ p: 2, fontWeight: 'bold' }}>
          Notifications
        </Typography>
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 3).map(notification => (
            <MenuItem 
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{ 
                whiteSpace: 'normal',
                backgroundColor: notification.is_read ? 'transparent' : '#f0f8ff'
              }}
            >
              <Box sx={{ display: 'flex', width: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: notification.is_read ? 'normal' : 'bold' }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {new Date(notification.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))
        )}
        
        <Divider />
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <Button 
            onClick={handleViewAllNotifications}
            fullWidth
            variant="text"
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationIcon;