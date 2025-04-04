import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Breadcrumbs,
  Divider,
  Button,
  Avatar,
  Grid,
  Chip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router';
import LayoutDefault from './LayoutDefault';
import { Link } from 'react-router';
import { useAuth } from './components/AuthContext';
import { getNotification, markAsRead } from './components/NotificationService';

const NotificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "warning" | "info" | "success";
  }>({
    open: false,
    message: "",
    severity: "info"
  });

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

  // Fetch notification data
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    
    const fetchNotificationDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getNotification(id, true); // Mark as read while fetching
        
        if (response.success && response.notification) {
          setNotification(response.notification);
        } else {
          setError("Failed to fetch notification details");
          setSnackbar({
            open: true,
            message: "Notification not found",
            severity: "error"
          });
        }
      } catch (err) {
        setError("An error occurred while fetching the notification");
        setSnackbar({
          open: true,
          message: "Error loading notification",
          severity: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotificationDetail();
  }, [id, isAuthenticated]);

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const handleNavigateToLink = () => {
    if (notification?.link) {
      // If link exists, navigate to it
      if (notification.link.startsWith('http')) {
        // If it's an external link, open in new tab
        window.open(notification.link, '_blank');
      } else {
        // If it's an internal link, use the router
        navigate(notification.link);
      }
    } else {
      // If no link is provided, show a message
      setSnackbar({
        open: true,
        message: "No additional details available for this notification",
        severity: "info"
      });
    }
  };
  
  // Only show View Details button if we have a valid link
  const shouldShowDetailsButton = () => {
    if (!notification?.link) return false;
    
    // Check if link is a valid route
    // For claim links
    if (notification.link.includes('/claim-details')) return true;
    
    // For match links
    if (notification.link.includes('/matches')) return true;
    
    // For found items
    if (notification.link.includes('/found-items')) return true;
    
    // For any other valid links
    return notification.link.startsWith('/') || notification.link.startsWith('http');
  };
  

  return (
    <LayoutDefault>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link to="/" color="inherit">
              Home
            </Link>
            <Link to="/notifications" color="inherit">
              Notifications
            </Link>
            <Typography color="text.primary">Details</Typography>
          </Breadcrumbs>
          
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/notifications')}
            sx={{ mb: 3 }}
          >
            Back to Notifications
          </Button>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : notification ? (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item>
                  <Avatar sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: notification.type === 'success' ? 'success.main' : 
                             notification.type === 'warning' ? 'warning.main' : 
                             notification.type === 'error' ? 'error.main' : 'info.main' 
                  }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h4" gutterBottom>
                    {notification.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={notification.type.toUpperCase()} 
                      color={
                        notification.type === 'success' ? 'success' : 
                        notification.type === 'warning' ? 'warning' : 
                        notification.type === 'error' ? 'error' : 'info'
                      } 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(notification.created_at)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {notification.message}
              </Typography>

              {notification.details && (
                <>
                  <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                    Additional Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                      {notification.details}
                    </Typography>
                  </Paper>
                </>
              )}
            
            
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Notification not found</Typography>
            </Box>
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

export default NotificationDetail;