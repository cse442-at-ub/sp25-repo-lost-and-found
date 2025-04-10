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
  Alert,
  CircularProgress
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
import { useAuth } from './components/AuthContext';
import { useNotifications } from './components/NotificationService';

const NotificationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "warning" | "info" | "success";
  }>({
    open: false,
    message: "",
    severity: "info"
  });

  // Use our custom notifications hook
  const { 
    loading, 
    error, 
    notifications, 
    unreadCount, 
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications
  } = useNotifications();

  // Check if user is authenticated, redirect if not
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setSnackbar({
        open: true,
        message: "Please log in to view notifications",
        severity: "warning"
      });
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch notifications data
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const handleNotificationClick = async (notificationId: string) => {
    // Mark as read if it's not already
    await markAsRead(notificationId);
    
    // Navigate to notification detail
    navigate(`/notification-detail/${notificationId}`);
  };

  const handleDeleteNotification = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const result = await deleteNotification(id);
    
    setSnackbar({
      open: true,
      message: result.success ? "Notification deleted" : "Failed to delete notification",
      severity: result.success ? "success" : "error"
    });
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead();
    
    setSnackbar({
      open: true,
      message: result.success ? "All notifications marked as read" : "Failed to mark all as read",
      severity: result.success ? "success" : "error"
    });
  };

  const handleDeleteReadNotifications = async () => {
    const result = await deleteReadNotifications();
    
    setSnackbar({
      open: true,
      message: result.success ? "Read notifications deleted" : "Failed to delete read notifications",
      severity: result.success ? "success" : "error"
    });
  };

  // Helper function to get the icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <DeleteIcon color="error" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Item Match Found',
      message: 'A black wallet matching your lost item description has been found. Please fill out the retrieval form to claim your item.',
      date: new Date(),
      read: false,
      type: 'success',
      link: '/retrieve-form' // Link to the retrieval form
    },
    // ... other notifications
  ];

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
                onClick={handleMarkAllAsRead} 
                disabled={unreadCount === 0 || loading}
                sx={{ mr: 1 }}
              >
                Mark All as Read
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleDeleteReadNotifications}
                disabled={!notifications.some(n => n.is_read) || loading}
                color="error"
              >
                Delete Read
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : notifications.length === 0 ? (
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
                      backgroundColor: notification.is_read ? 'transparent' : '#f0f8ff',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                    onClick={() => handleNotificationClick(notification.id)}
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
                        <Avatar sx={{ bgcolor: notification.is_read ? 'grey.300' : 'primary.main' }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </Grid>
                      <Grid item xs={10}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" component="div">
                              {notification.title}
                            </Typography>
                            {!notification.is_read && (
                              <CircleIcon sx={{ ml: 1, color: 'primary.main', fontSize: 12 }} />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.created_at)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {notification.message}
                        </Typography>
                        <Chip 
                          label={notification.is_read ? "Read" : "Unread"} 
                          size="small" 
                          color={notification.is_read ? "default" : "primary"}
                          variant={notification.is_read ? "outlined" : "filled"}
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