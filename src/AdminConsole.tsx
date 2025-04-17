import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Divider, 
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  FindInPage as FindIcon, 
  Email as EmailIcon, 
  CompareArrows as CompareIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';
import LayoutDefault from './LayoutDefault';


const AdminConsole = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [stats, setStats] = useState({
    totalLostItems: 0,
    totalFoundItems: 0,
    pendingClaims: 0,
    messages: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (!loading && (!isAuthenticated || !isAdmin)) {
      setSnackbar({
        open: true,
        message: 'Admin access required. Redirecting...',
        severity: 'error'
      });
      setTimeout(() => navigate('/not-admin'), 2000);
    } else if (!loading && isAuthenticated && isAdmin) {
      // Fetch admin dashboard statistics
      fetchStats();
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      // In a real implementation, you would fetch actual stats from the backend
      // For this example, we'll use mock data
      setTimeout(() => {
        setStats({
          totalLostItems: 24,
          totalFoundItems: 18,
          pendingClaims: 7,
          messages: 12
        });
        setLoadingStats(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoadingStats(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const adminMenuItems = [
    {
      title: 'Admin Claims',
      description: 'Review and manage all user claims for lost and found items',
      icon: <FindIcon fontSize="large" color="primary" />,
      path: '/admin-claim',
      color: '#e3f2fd',
      count: stats.pendingClaims
    },
    {
      title: 'Admin Match',
      description: 'Match lost items with found items to help reunite users with their belongings',
      icon: <CompareIcon fontSize="large" color="secondary" />,
      path: '/admin-match',
      color: '#e8f5e9',
      count: null
    },
    {
      title: 'View Messages',
      description: 'Manage and respond to user messages and support tickets',
      icon: <EmailIcon fontSize="large" color="action" />,
      path: '/view-messages',
      color: '#fff8e1',
      count: stats.messages
    }
  ];

  if (loading || loadingStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <LayoutDefault>
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8, py: 2 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: '#f8f9fa', position: 'relative' }}>
        <IconButton 
          sx={{ position: 'absolute', top: 16, left: 16 }} 
          onClick={() => navigate('/')}
          aria-label="Back to home"
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ 
          mb: 1, 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Admin Console
        </Typography>
        
        <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
          Manage lost and found items, user claims, and system settings
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Statistics cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Lost Items</Typography>
              <Typography variant="h3">{stats.totalLostItems}</Typography>
              <Typography variant="body2" color="textSecondary">Total reports</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Found Items</Typography>
              <Typography variant="h3">{stats.totalFoundItems}</Typography>
              <Typography variant="body2" color="textSecondary">Total reports</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#fff8e1', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Pending Claims</Typography>
              <Typography variant="h3">{stats.pendingClaims}</Typography>
              <Typography variant="body2" color="textSecondary">Awaiting review</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Messages</Typography>
              <Typography variant="h3">{stats.messages}</Typography>
              <Typography variant="body2" color="textSecondary">Unread messages</Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Menu Items */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
            Admin Actions
          </Typography>
          
          <Grid container spacing={3}>
            {adminMenuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  },
                  bgcolor: item.color,
                  position: 'relative'
                }}>
                  {item.count !== null && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        backgroundColor: 'error.main',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="body2" color="white">
                        {item.count}
                      </Typography>
                    </Box>
                  )}
                  <CardContent>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" component="h2" gutterBottom align="center">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph align="center">
                      {item.description}
                    </Typography>
                  </CardContent>
                  <Box sx={{ flexGrow: 1 }} />
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate(item.path)}
                      sx={{ 
                        px: 3,
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4
                        }
                      }}
                    >
                      Go to {item.title}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Admin Tips</Typography>
        </Box>
        <Typography variant="body2" paragraph>
          • Review pending claims daily to maintain a good user experience.
        </Typography>
        <Typography variant="body2" paragraph>
          • Use the Match feature to help connect lost items with their rightful owners.
        </Typography>
        <Typography variant="body2" paragraph>
          • Respond to user messages within 24 hours to maintain good communication.
        </Typography>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
    </LayoutDefault>
  );
};

export default AdminConsole;