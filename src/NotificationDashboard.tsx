import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Divider, 
  Badge, 
  Chip,
  Avatar,
  Container,
  Grid,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import LayoutDefault from './LayoutDefault';
import { useCookies } from 'react-cookie';

// Notification interface
interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type: 'success' | 'warning' | 'info';
  link?: string;
}

const NotificationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies(['session_id']);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "warning" | "info" | "success";
  }>({
    open: false,
    message: "",
    severity: "info"
  });

  // Check if user is logged in, redirect if not
  useEffect(() => {
    if (!cookies.session_id) {
      navigate('/login');
      return;
    }
  }, [cookies.session_id, navigate]);

  // Mock data fetch - replace with your API call
  useEffect(() => {
    // Skip fetch if not logged in
    if (!cookies.session_id) return;
    
    // Simulating a fetch call
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Item Match Found',
        message: 'A black wallet matching your lost item description has been found. Check your claim page for more details.',
        date: new Date(),
        read: false,
        type: 'success',
        link: '/claim'
      },
      {
        id: '2',
        title: 'Claim Request Approved',
        message: 'Your claim request for the lost laptop has been approved. Please visit the office to collect your item.',
        date: new Date(Date.now() - 86400000), // 1 day ago
        read: true,
        type: 'success',
        link: '/claim'
      },
      {
        id: '3',
        title: 'Item Description Update',
        message: 'We need more information about your lost keys. Please update your report with additional details.',
        date: new Date(Date.now() - 172800000), // 2 days ago
        read: false,
        type: 'warning',
        link: '/report-lost-item'
      },
      {
        id: '4',
        title: 'New Lost Items Reported',
        message: 'Several new items were reported lost in your area. Check if any match items you found.',
        date: new Date(Date.now() - 259200000), // 3 days ago
        read: false,
        type: 'info',
        link: '/report-found-item'
      },
      {
        id: '5',
        title: 'Account Security',
        message: 'Your password was changed successfully. If you did not make this change, please contact support immediately.',
        date: new Date(Date.now() - 345600000), // 4 days ago
        read: true,
        type: 'warning',
        link: '/settings'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prevNotifications => 
      prevNotifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    
    // If there's a link, navigate to it
    if (notification.link) {
      navigate(notification.link);
    } else {
      // Navigate to a detailed view with the notification ID
      navigate(`/notification-detail/${notification.id}`);
    }
  };

  const handleDeleteNotification = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
    setSnackbar({
      open: true,
      message: "Notification deleted",
      severity: "success"
    });
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setSnackbar({
      open: true,
      message: "All notifications marked as read",
      severity: "success"
    });
  };

  const deleteAllRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => !notification.read)
    );
    setSnackbar({
      open: true,
      message: "Read notifications deleted",
      severity: "success"
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Helper function to get the icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <LayoutDefault>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon sx={{ mr: 1 }} />
              <Typography variant="h4">
                Notifications
                {unreadCount > 0 && (
                  <Badge 
                    badgeContent={unreadCount} 
                    color="error" 
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
            </Box>
            <Box>
              <Button 
                variant="outlined" 
                onClick={markAllAsRead} 
                disabled={unreadCount === 0}
                sx={{ mr: 1 }}
              >
                Mark All as Read
              </Button>
              <Button 
                variant="outlined" 
                onClick={deleteAllRead}
                disabled={!notifications.some(n => n.read)}
                color="error"
              >
                Delete Read
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <Typography variant="h6" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      cursor: 'pointer', 
                      backgroundColor: notification.read ? 'transparent' : '#f0f8ff',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                    onClick={() => handleNotificationClick(notification)}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Grid container spacing={2}>
                      <Grid item>
                        <Avatar sx={{ bgcolor: notification.read ? 'grey.300' : 'primary.main' }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </Grid>
                      <Grid item xs={10}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" component="div">
                              {notification.title}
                            </Typography>
                            {!notification.read && (
                              <CircleIcon sx={{ ml: 1, color: 'primary.main', fontSize: 12 }} />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.date)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {notification.message}
                        </Typography>
                        <Chip 
                          label={notification.read ? "Read" : "Unread"} 
                          size="small" 
                          color={notification.read ? "default" : "primary"}
                          variant={notification.read ? "outlined" : "filled"}
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LayoutDefault>
  );
};

export default NotificationDashboard;