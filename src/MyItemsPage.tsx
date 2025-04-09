import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { Edit, Delete, Warning } from '@mui/icons-material';
import LayoutDefault from './LayoutDefault';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';

// Interface for all items (both lost and found)
interface UserItem {
  id: number;
  item_type: 'lost' | 'found';
  item_name: string;
  date: string;
  location: string;
  description: string;
  image?: string;
  is_deleted: number;
}

function MyItemsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // States for the edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<UserItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    item_name: '',
    date: '',
    location: '',
    description: ''
  });
  
  // States for the delete confirmation modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<UserItem | null>(null);
  
  // State for alerts
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success' as 'error' | 'warning' | 'info' | 'success'
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch user's items
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchItems = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('./Backend/getUserItems.php', {
          credentials: 'include' // Include cookies for session
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setItems(data.items || []);
        } else {
          setError(data.message || 'Failed to load your items');
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Failed to load your items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, [isAuthenticated]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Open edit modal
  const handleEditOpen = (item: UserItem) => {
    setEditItem(item);
    setEditFormData({
      item_name: item.item_name,
      date: item.date,
      location: item.location,
      description: item.description
    });
    setEditOpen(true);
  };
  
  // Close edit modal
  const handleEditClose = () => {
    setEditOpen(false);
    setEditItem(null);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save edited item
  const handleSaveEdit = async () => {
    if (!editItem) return;
    
    try {
      const response = await fetch('./Backend/updateUserItem.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editItem.id,
          item_type: editItem.item_type,
          action: 'edit',
          ...editFormData
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the item in the state
        setItems(prevItems => prevItems.map(item => 
          (item.id === editItem.id && item.item_type === editItem.item_type) 
            ? { ...item, ...editFormData } 
            : item
        ));
        
        setAlert({
          open: true,
          message: 'Item updated successfully',
          severity: 'success'
        });
      } else {
        setAlert({
          open: true,
          message: data.message || 'Failed to update item',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setAlert({
        open: true,
        message: 'An error occurred while updating the item',
        severity: 'error'
      });
    } finally {
      handleEditClose();
    }
  };
  
  // Open delete confirmation modal
  const handleDeleteOpen = (item: UserItem) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };
  
  // Close delete confirmation modal
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeleteItem(null);
  };
  
  // Delete item (soft delete)
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    
    try {
      const response = await fetch('./Backend/updateUserItem.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: deleteItem.id,
          item_type: deleteItem.item_type,
          action: 'delete'
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the item's deleted status in state (or remove it)
        setItems(prevItems => prevItems.filter(item => 
          !(item.id === deleteItem.id && item.item_type === deleteItem.item_type)
        ));
        
        setAlert({
          open: true,
          message: 'Item deleted successfully',
          severity: 'success'
        });
      } else {
        setAlert({
          open: true,
          message: data.message || 'Failed to delete item',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setAlert({
        open: true,
        message: 'An error occurred while deleting the item',
        severity: 'error'
      });
    } finally {
      handleDeleteClose();
    }
  };
  
  // Filter items based on tab
  const filteredItems = tabValue === 0 
    ? items 
    : tabValue === 1 
      ? items.filter(item => item.item_type === 'lost')
      : items.filter(item => item.item_type === 'found');
  
  // If loading, show loading spinner
  if (loading) {
    return (
      <LayoutDefault>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </LayoutDefault>
    );
  }
  
  return (
    <LayoutDefault>
      <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
        <Typography variant="h3" sx={{ mb: 3, textAlign: 'center' }}>
          My Items
        </Typography>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="All Items" />
            <Tab label="Lost Items" />
            <Tab label="Found Items" />
          </Tabs>
        </Paper>
        
        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : filteredItems.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>No items to display</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/report-lost-item')}
              >
                Report Lost Item
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => navigate('/report-found-item')}
              >
                Report Found Item
              </Button>
            </Box>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={`${item.item_type}-${item.id}`}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.image ? `./Backend/${item.image}` : "./no-image.png"}
                    alt={item.item_name}
                    sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div">
                        {item.item_name}
                      </Typography>
                      <Chip 
                        label={item.item_type === 'lost' ? 'Lost' : 'Found'} 
                        color={item.item_type === 'lost' ? 'error' : 'success'} 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>{item.item_type === 'lost' ? 'Last Seen:' : 'Found At:'}</strong> {item.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date:</strong> {new Date(item.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {item.description.length > 100 
                        ? `${item.description.substring(0, 100)}...` 
                        : item.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditOpen(item)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteOpen(item)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Edit Item Dialog */}
        <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="item_name"
              name="item_name"
              label="Item Name"
              type="text"
              fullWidth
              variant="outlined"
              value={editFormData.item_name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="date"
              name="date"
              label="Date"
              type="date"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={editFormData.date}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="location"
              name="location"
              label={editItem?.item_type === 'lost' ? 'Last Seen Location' : 'Found Location'}
              type="text"
              fullWidth
              variant="outlined"
              value={editFormData.location}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="description"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={editFormData.description}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained" color="primary">Save</Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteOpen} onClose={handleDeleteClose}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning color="warning" sx={{ mr: 1 }} />
              Confirm Deletion
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete this {deleteItem?.item_type} item "{deleteItem?.item_name}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteClose}>Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">Delete</Button>
          </DialogActions>
        </Dialog>
        
        {/* Alert Snackbar */}
        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          <Alert 
            onClose={() => setAlert({ ...alert, open: false })} 
            severity={alert.severity}
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </LayoutDefault>
  );
}

export default MyItemsPage;