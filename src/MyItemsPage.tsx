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
  Tab,
  Snackbar
} from '@mui/material';
import { Edit, Delete, Warning, ArrowBack, FindInPage } from '@mui/icons-material';
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
  status?: string;
  is_deleted?: number;
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
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // States for the delete confirmation modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<UserItem | null>(null);
  
  // State for the mark as found confirmation modal
  const [markAsFoundOpen, setMarkAsFoundOpen] = useState(false);
  const [markAsFoundItem, setMarkAsFoundItem] = useState<UserItem | null>(null);
  
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
          credentials: 'include' // Important for sending cookies/session data
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch items (Status: ${response.status})`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setItems(data.items || []);
        } else {
          setError(data.message || 'Unknown error occurred while fetching your items');
        }
      } catch (err) {
        console.error('Error fetching items:', err);
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
    setImagePreview(item.image ? `./Backend/${item.image}` : null);
    setNewImage(null);
    setEditOpen(true);
  };
  
  // Close edit modal
  const handleEditClose = () => {
    setEditOpen(false);
    setEditItem(null);
    setNewImage(null);
    setImagePreview(null);
  };
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save edited item to backend
  const handleSaveEdit = async () => {
    if (!editItem) return;
    
    try {
      // If we have a new image, we need to use FormData instead of JSON
      if (newImage) {
        const formData = new FormData();
        formData.append('id', editItem.id.toString());
        formData.append('item_type', editItem.item_type);
        formData.append('action', 'edit');
        formData.append('item_name', editFormData.item_name);
        formData.append('date', editFormData.date);
        formData.append('location', editFormData.location);
        formData.append('description', editFormData.description);
        formData.append('image', newImage);
        
        const response = await fetch('./Backend/updateUserItem.php', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Update local state to reflect changes, including the new image path
          setItems(prevItems => prevItems.map(item => 
            (item.id === editItem.id && item.item_type === editItem.item_type) 
              ? { 
                  ...item, 
                  item_name: editFormData.item_name,
                  date: editFormData.date,
                  location: editFormData.location,
                  description: editFormData.description,
                  image: data.image_path || item.image // Use new image path if provided
                } 
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
      } else {
        // No new image, just use JSON
        const response = await fetch('./Backend/updateUserItem.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editItem.id,
            item_type: editItem.item_type,
            action: 'edit',
            item_name: editFormData.item_name,
            date: editFormData.date,
            location: editFormData.location,
            description: editFormData.description
          }),
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Update local state to reflect changes
          setItems(prevItems => prevItems.map(item => 
            (item.id === editItem.id && item.item_type === editItem.item_type) 
              ? { 
                  ...item, 
                  item_name: editFormData.item_name,
                  date: editFormData.date,
                  location: editFormData.location,
                  description: editFormData.description 
                } 
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
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setAlert({
        open: true,
        message: 'Error updating item. Please try again later.',
        severity: 'error'
      });
    }
    
    handleEditClose();
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
  
  // Delete item (archive)
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
        // Remove item from local state
        setItems(prevItems => prevItems.filter(item => 
          !(item.id === deleteItem.id && item.item_type === deleteItem.item_type)
        ));
        
        setAlert({
          open: true,
          message: 'Item archived successfully',
          severity: 'success'
        });
      } else {
        setAlert({
          open: true,
          message: data.message || 'Failed to archive item',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error archiving item:', error);
      setAlert({
        open: true,
        message: 'Error archiving item. Please try again later.',
        severity: 'error'
      });
    }
    
    handleDeleteClose();
  };
  
  // Open mark as found confirmation modal
  const handleMarkAsFoundOpen = (item: UserItem) => {
    setMarkAsFoundItem(item);
    setMarkAsFoundOpen(true);
  };
  
  // Close mark as found confirmation modal
  const handleMarkAsFoundClose = () => {
    setMarkAsFoundOpen(false);
    setMarkAsFoundItem(null);
  };
  
  // Mark item as found (update status and archive)
  const handleConfirmMarkAsFound = async () => {
    if (!markAsFoundItem) return;
    
    try {
      const response = await fetch('./Backend/updateUserItem.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: markAsFoundItem.id,
          item_type: 'lost', // This will always be a lost item being marked as found
          action: 'mark_found'
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove item from local state since it's archived
        setItems(prevItems => prevItems.filter(item => 
          !(item.id === markAsFoundItem.id && item.item_type === 'lost')
        ));
        
        setAlert({
          open: true,
          message: 'Item marked as found and archived successfully',
          severity: 'success'
        });
      } else {
        setAlert({
          open: true,
          message: data.message || 'Failed to mark item as found',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error marking item as found:', error);
      setAlert({
        open: true,
        message: 'Error marking item as found. Please try again later.',
        severity: 'error'
      });
    }
    
    handleMarkAsFoundClose();
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h3" sx={{ textAlign: 'center', flexGrow: 1 }}>
            My Items
          </Typography>
        </Box>
        
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
                      {/* Mark as Found button (only for lost items) */}
                      {item.item_type === 'lost' && (
                        <IconButton 
                          color="success" 
                          onClick={() => handleMarkAsFoundOpen(item)}
                          size="small"
                          sx={{ mr: 1 }}
                          title="Mark as Found"
                        >
                          <FindInPage />
                        </IconButton>
                      )}
                      
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditOpen(item)}
                        size="small"
                        sx={{ mr: 1 }}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteOpen(item)}
                        size="small"
                        title="Archive"
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
              sx={{ mb: 3 }}
            />
            
            {/* Image Upload Section */}
            <Typography variant="subtitle1" gutterBottom>
              Item Image
            </Typography>
            
            {/* Current/Preview Image */}
            {imagePreview && (
              <Box sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
                <img 
                  src={imagePreview} 
                  alt="Item Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '8px',
                    backgroundColor: '#f5f5f5'
                  }} 
                />
              </Box>
            )}
            
            {/* Image Upload Button */}
            <Box sx={{ mt: 1 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload-button"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload-button">
                <Button 
                  component="span" 
                  variant="outlined" 
                  fullWidth
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Button>
              </label>
            </Box>
            {newImage && (
              <Typography variant="caption" color="text.secondary">
                Selected file: {newImage.name}
              </Typography>
            )}
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
              Archive Item
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to archive this {deleteItem?.item_type} item "{deleteItem?.item_name}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action will remove the item from active listings.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteClose}>Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">Archive</Button>
          </DialogActions>
        </Dialog>
        
        {/* Mark as Found Confirmation Dialog */}
        <Dialog open={markAsFoundOpen} onClose={handleMarkAsFoundClose}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FindInPage color="success" sx={{ mr: 1 }} />
              Mark as Found
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to mark "{markAsFoundItem?.item_name}" as found?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This will archive the lost item and update its status to found.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleMarkAsFoundClose}>Cancel</Button>
            <Button onClick={handleConfirmMarkAsFound} variant="contained" color="success">Mark as Found</Button>
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