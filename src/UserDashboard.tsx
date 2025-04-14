import { useEffect, useState } from "react";
import LayoutDefault from "./LayoutDefault";
import { 
  Box, Card, CardActions, CardContent, CardMedia, Container, 
  IconButton, List, ListItem, ListItemIcon, ListItemText, 
  Typography, Divider, Paper, Alert, CircularProgress
} from "@mui/material";
import { Cancel, CheckCircle, Delete, Edit, Pending } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [founds, setFounds] = useState([]);
  const [losts, setLosts] = useState([]);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [userName, setUserName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user data and items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user info
        const userRes = await fetch('./Backend/userinfo.php');
        const userData = await userRes.json();
        setUserName(userData.first_name ? 
          `${userData.first_name} ${userData.last_name || ''}`.trim() : 
          'User');

        // Fetch and filter found items (approved/claimed/matched)
        const foundRes = await fetch('./Backend/getAllMyFound.php');
        const foundItems = await foundRes.json();
        const uniqueFounds = [...new Map(foundItems.map(item => 
          [item.id, item])).values()].filter(item => 
          item.match_id != null || item.claim_id != null || item.approved != null
        );
        setFounds(uniqueFounds);

        // Fetch and filter lost items (unprocessed)
        const lostRes = await fetch('./Backend/getAllMyLost.php');
        const lostItems = await lostRes.json();
        const uniqueLosts = [...new Map(lostItems.map(item => 
          [item.id, item])).values()].filter(item => 
          item.match_id == null && item.claim_id == null && item.approved == null
        );
        setLosts(uniqueLosts);

      } catch (error) {
        setErrorMsg("Failed to load data");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        } else {
          setFounds(prev => prev.filter(item => item.id !== id));
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
    const isEditable = type === 'lost'; // Only lost items are editable
    const isFound = type === 'found';

    return (
      <Card key={`${type}-${item.id}`} sx={{ 
        minHeight: '320px', 
        borderRadius: 3, 
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CardMedia
          component="img"
          image={`Backend/${item.image}`}
          sx={{ height: 180, objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isFound ? 'Found at' : 'Last seen at'} <strong>{item.location}</strong>
          </Typography>
          <Typography variant="body2" mt={1}>{item.description}</Typography>

          <Divider sx={{ my: 2 }} />

          <List dense>
            <ListItem>
              <ListItemIcon>
                {item.match_id ? <CheckCircle color="success" /> : <Pending />}
              </ListItemIcon>
              <ListItemText primary={item.match_id ? "Matched" : "To be matched"} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                {item.claim_id ? <CheckCircle color="success" /> : <Pending />}
              </ListItemIcon>
              <ListItemText primary={item.claim_id ? "Claimed" : "To be claimed"} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                {item.approved === null ? <Pending /> : 
                 item.approved ? <CheckCircle color="success" /> : <Cancel color="error" />}
              </ListItemIcon>
              <ListItemText primary={
                item.approved === null ? "To be approved" : 
                item.approved ? "Approved" : "Rejected"
              } />
            </ListItem>
          </List>
        </CardContent>

        {isEditable && (
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <IconButton onClick={() => handleEdit(type, item)}>
              <Edit />
            </IconButton>
            <IconButton 
              onClick={() => confirmingDeleteId === item.id 
                ? handleDelete(type, item.id) 
                : setConfirmingDeleteId(item.id)}
            >
              {confirmingDeleteId === item.id ? 
                <Typography color="error">Confirm?</Typography> : 
                <Delete />}
            </IconButton>
          </CardActions>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <LayoutDefault>
        <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Container>
      </LayoutDefault>
    );
  }

  return (
    <LayoutDefault>
      <Container>
        <Typography variant="h3" mb={2}>User Dashboard</Typography>
        
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 4 }}>
          <Typography variant="h4" gutterBottom>Founds</Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: 3 
          }}>
            {founds.map(item => renderCard(item, 'found'))}
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h4" gutterBottom>Losts</Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: 3 
          }}>
            {losts.map(item => renderCard(item, 'lost'))}
          </Box>
        </Paper>
      </Container>
    </LayoutDefault>
  );
}

export default UserDashboard;