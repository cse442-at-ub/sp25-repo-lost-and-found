import { useEffect, useState } from "react";
import LayoutDefault from "./LayoutDefault";
import { 
  Box, Card, CardActions, CardContent, CardMedia, Container, 
  IconButton, List, ListItem, ListItemIcon, ListItemText, 
  Typography, Divider, Paper, Alert, CircularProgress,
  Avatar, Chip, Grid, useTheme, Button
} from "@mui/material";
import { Cancel, CheckCircle, Delete, Edit, Pending } from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useAuth } from "./components/AuthContext";

function UserDashboard() {
  const [adminActionItems, setAdminActionItems] = useState([]);
  const [losts, setLosts] = useState([]);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [userName, setUserName] = useState('User');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const { checkAuthStatus } = useAuth();

  // Fetch user data and items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user info
        const userRes = await fetch('./Backend/userinfo.php');
        const userData = await userRes.json();
        const name = [userData.first_name, userData.last_name]
          .filter(Boolean)
          .join(' ')
          .trim();
        setUserName(name || 'User');

        // Fetch lost items
        const lostRes = await fetch('./Backend/getAllMyLost.php');
        const lostItems = await lostRes.json();

        // Log the raw data for debugging
        console.log('Raw Lost Items:', lostItems);

        // Tag items with their origin
        const taggedLostItems = lostItems.map(item => ({
          ...item,
          origin: 'user_reported_lost'
        }));

        // Classify items:
        // - Admin Action: items with any admin action (match_id, claim_id, or approved)
        // - Lost: items with no admin action
        setAdminActionItems(taggedLostItems.filter(item => 
          item.match_id != null || 
          item.claim_id != null || 
          item.approved != null
        ));

        setLosts(taggedLostItems.filter(item => 
          item.match_id == null && 
          item.claim_id == null && 
          item.approved == null
        ));

        // Log the final filtered items
        console.log('Admin Action Items:', adminActionItems);
        console.log('Lost Items:', losts);

      } catch (error) {
        setErrorMsg("Failed to load data");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('./Backend/logout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        await checkAuthStatus();
        navigate('/');
      } else {
        setErrorMsg(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error("Logout error:", error);
      setErrorMsg('Failed to logout. Please try again.');
    }
  };

  const handleEdit = (type, item) => {
    navigate(`/edit/${type}/${item.id}`);
  };

  const handleDelete = async (type, id) => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('type', type);
      formData.append('action', 'delete');

      const response = await fetch('./Backend/deleteandeditbyID.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        if (type === 'lost') {
          setLosts(prev => prev.filter(item => item.id !== id));
        }
      } else {
        setErrorMsg(data.error || "Delete failed");
      }
    } catch (error) {
      setErrorMsg("Delete request failed");
    } finally {
      setConfirmingDeleteId(null);
    }
  };

  const renderCard = (item, type) => {
    const isEditable = type === 'lost';
    const statusColor = item.match_id ? 'success' : 
                       item.approved === false ? 'error' : 'info';

    return (
      <Card key={`${type}-${item.id}`} sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}>
        <CardMedia
          component="img"
          image={`Backend/${item.image}`}
          sx={{ 
            height: 200,
            objectFit: 'cover',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          }}
        />
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" fontWeight={600} color={type === 'admin_action' ? 'primary.main' : 'secondary.main'}>
              {item.name}
            </Typography>
            <Chip 
              label={type === 'admin_action' ? 'FOUND' : 'LOST'} 
              size="small"
              color={type === 'admin_action' ? 'primary' : 'secondary'}
              variant="outlined"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" mb={1}>
            <Box component="span" fontWeight={500}>Location:</Box> {item.location}
          </Typography>
          
          <Typography variant="body2" mb={2} sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {item.description}
          </Typography>

          <Divider sx={{ my: 1, borderColor: 'divider' }} />

          <List dense sx={{ py: 0 }}>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.match_id ? 
                  <CheckCircle color="success" /> : 
                  <Pending color={statusColor} />}
              </ListItemIcon>
              <ListItemText 
                primary={item.match_id ? "Matched" : "Pending match"} 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.claim_id ? 
                  <CheckCircle color="success" /> : 
                  <Pending color={statusColor} />}
              </ListItemIcon>
              <ListItemText 
                primary={item.claim_id ? "Claimed" : "Not claimed"} 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            {type === 'admin_action' && (
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {item.approved === true ? 
                    <CheckCircle color="success" /> : 
                    item.approved === false ? 
                    <Cancel color="error" /> : 
                    <Pending color="info" />}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    item.approved === true ? "Approved" : 
                    item.approved === false ? "Rejected" : 
                    "Pending approval"
                  } 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            )}
          </List>
        </CardContent>

        {isEditable && (
          <CardActions sx={{ 
            justifyContent: 'flex-end', 
            p: 1, 
            bgcolor: 'background.default',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12
          }}>
            <IconButton 
              onClick={() => handleEdit(type, item)}
              color="primary"
              size="small"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton 
              onClick={() => confirmingDeleteId === item.id 
                ? handleDelete(type, item.id) 
                : setConfirmingDeleteId(item.id)}
              color={confirmingDeleteId === item.id ? 'error' : 'default'}
              size="small"
            >
              {confirmingDeleteId === item.id ? 
                <Typography variant="caption" color="error">Confirm?</Typography> : 
                <Delete fontSize="small" />}
            </IconButton>
          </CardActions>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <LayoutDefault>
        <Container sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '50vh'
        }}>
          <CircularProgress size={60} thickness={4} />
        </Container>
      </LayoutDefault>
    );
  }

  return (
    <LayoutDefault>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 4,
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.main, 
              width: 64, 
              height: 64,
              mr: 3,
              fontSize: '1.75rem'
            }}>
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={600} color="text.primary">
                User Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Welcome back, <Box component="span" color="primary.main">{userName}</Box>
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleLogout}
            sx={{ alignSelf: 'center' }}
          >
            Logout
          </Button>
        </Box>
        
        {/* Error Alert */}
        {errorMsg && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setErrorMsg('')}
          >
            {errorMsg}
          </Alert>
        )}

        {/* Items Grid */}
        <Grid container spacing={4}>
          {/* Admin Action */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}>
              <Typography variant="h5" fontWeight={600} mb={1} color="primary.main">
                Admin Action
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                These items have been acted upon by an admin (matched, claimed, or approved) and are no longer editable:
              </Typography>
              {adminActionItems.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  py: 6,
                  color: 'text.secondary'
                }}>
                  <Pending sx={{ fontSize: 48, mb: 2, color: 'grey.400' }} />
                  <Typography>No admin actions to display</Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {adminActionItems.map(item => (
                    <Grid item xs={12} sm={6} key={`admin_action-${item.id}`}>
                      {renderCard(item, 'admin_action')}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>

          {/* Lost Items */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}>
              <Typography variant="h5" fontWeight={600} mb={1} color="secondary.main">
                Lost Items
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                These are your reported lost items awaiting admin review for potential matches:
              </Typography>
              {losts.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  py: 6,
                  color: 'text.secondary'
                }}>
                  <Pending sx={{ fontSize: 48, mb: 2, color: 'grey.400' }} />
                  <Typography>No lost items to display</Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {losts.map(item => (
                    <Grid item xs={12} sm={6} key={`lost-${item.id}`}>
                      {renderCard(item, 'lost')}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </LayoutDefault>
  );
}

export default UserDashboard;