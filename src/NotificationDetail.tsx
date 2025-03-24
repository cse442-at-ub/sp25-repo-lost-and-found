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
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router';
import LayoutDefault from './LayoutDefault';
import { Link } from 'react-router';
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
  details?: string;
}

const NotificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cookies] = useCookies(['session_id']);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
    
    // Simulating API call delay
    const fetchTimeout = setTimeout(() => {
      // Mock notification data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Item Match Found',
          message: 'A black wallet matching your lost item description has been found. Check your claim page for more details.',
          date: new Date(),
          read: true,
          type: 'success',
          link: '/claim',
          details: 'A black leather wallet with your ID was turned in to our lost and found center on March 23, 2025. The wallet was found near the Student Union building. Please bring your identification to verify ownership when you come to collect your item. Our office is open Monday through Friday from 9 AM to 4 PM.'
        },
        {
          id: '2',
          title: 'Claim Request Approved',
          message: 'Your claim request for the lost laptop has been approved. Please visit the office to collect your item.',
          date: new Date(Date.now() - 86400000),
          read: true,
          type: 'success',
          link: '/claim',
          details: 'Your claim request for the Dell XPS 13 laptop (Service Tag: ABC123) has been approved. You can collect your item from the campus lost and found office located in the Student Union Room 105. Please bring your university ID and the claim confirmation email. The office is open weekdays from 9 AM to 4 PM.'
        },
        {
          id: '3',
          title: 'Item Description Update',
          message: 'We need more information about your lost keys. Please update your report with additional details.',
          date: new Date(Date.now() - 172800000),
          read: true,
          type: 'warning',
          link: '/report-lost-item',
          details: 'We have received several sets of keys that match the general description you provided in your lost item report (Case #LF-2345). To help us identify your keys, please update your report with more specific details such as any keychains, the number of keys, distinctive shapes, or markings. This will help us match the correct item to your report.'
        },
        {
          id: '4',
          title: 'New Lost Items Reported',
          message: 'Several new items were reported lost in your area. Check if any match items you found.',
          date: new Date(Date.now() - 259200000),
          read: true,
          type: 'info',
          link: '/report-found-item',
          details: 'In the past 24 hours, the following items have been reported lost in your campus area: 1) Blue Hydro Flask water bottle with stickers, 2) AirPods Pro in a red case, 3) Computer science textbook, 4) Green North Face backpack. If you have found any of these items, please update your found item report or submit a new one.'
        },
        {
          id: '5',
          title: 'Account Security',
          message: 'Your password was changed successfully. If you did not make this change, please contact support immediately.',
          date: new Date(Date.now() - 345600000),
          read: true,
          type: 'warning',
          link: '/settings',
          details: 'Your account password was changed on March 20, 2025 at 3:42 PM EST. This change was made using the password reset feature from IP address 192.168.1.1. If you did not initiate this change, please contact our support team immediately at support@lostandfound.edu or call our security hotline at (716) 555-1234.'
        }
      ];

      const foundNotification = mockNotifications.find(n => n.id === id);
      if (foundNotification) {
        setNotification(foundNotification);
      } else {
        setSnackbar({
          open: true,
          message: "Notification not found",
          severity: "error"
        });
      }
      setLoading(false);
    }, 800);

    return () => clearTimeout(fetchTimeout);
  }, [id, cookies.session_id]);

  // Get icon based on notification type
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
      navigate(notification.link);
    }
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
              <Typography>Loading notification details...</Typography>
            </Box>
          ) : notification ? (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item>
                  <Avatar sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: notification.type === 'success' ? 'success.main' : 
                             notification.type === 'warning' ? 'warning.main' : 'info.main' 
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
                        notification.type === 'warning' ? 'warning' : 'info'
                      } 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(notification.date)}
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

              {notification.link && (
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleNavigateToLink}
                  >
                    {notification.type === 'success' ? 'View Details' : 
                     notification.type === 'warning' ? 'Take Action' : 'View More'}
                  </Button>
                </Box>
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