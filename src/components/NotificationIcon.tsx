// components/NotificationIcon.tsx
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
  Button
} from '@mui/material';
import { Notifications, NotificationsOff } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router';
import { useCookies } from 'react-cookie';

// Simple notification interface
interface Notification {
  id: string;
  message: string;
  date: Date;
  read: boolean;
}

// Define the cookie names that will be used
type CookieNames = 'is_admin' | 'session_id';

const NotificationIcon: React.FC = () => {
  const navigate = useNavigate();
  // Specify the extended type for useCookies
  const [cookies] = useCookies<CookieNames>(['session_id', 'is_admin']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'A lost item matching your description has been found',
      date: new Date(),
      read: false
    },
    {
      id: '2',
      message: 'Your claim request has been approved',
      date: new Date(Date.now() - 86400000),
      read: true
    }
  ]);

  // Mock data fetch - replace with your API call
  useEffect(() => {
    // Only fetch notifications if user is logged in
    if (!cookies.session_id) {
      return;
    }
    
    // Simulating a fetch call
    const mockNotifications: Notification[] = [
      {
        id: '1',
        message: 'A lost item matching your description has been found',
        date: new Date(),
        read: false
      },
      {
        id: '2',
        message: 'Your claim request has been approved',
        date: new Date(Date.now() - 86400000),
        read: true
      }
    ];

    setNotifications(mockNotifications);
  }, [cookies.session_id]);

  useEffect(() => {
    // Only load settings if user is logged in
    if (!cookies.session_id) {
      return;
    }
    
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
  }, [cookies.session_id]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  const handleViewAllNotifications = () => {
    handleCloseMenu();
    navigate('/notifications');
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    handleCloseMenu();
    navigate(`/notification-detail/${notification.id}`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Only render the notification icon if user is logged in
  if (!cookies.session_id) {
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
        
        {notifications.length === 0 ? (
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
                backgroundColor: notification.read ? 'transparent' : '#f0f8ff'
              }}
            >
              <Box sx={{ display: 'flex', width: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2">{notification.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.date.toLocaleString()}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={(e) => deleteNotification(notification.id, e)}
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