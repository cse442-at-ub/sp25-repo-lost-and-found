import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Chip, 
  Grid, 
  Divider, 
  CircularProgress,
  Alert,
  CardMedia
} from '@mui/material';
import LayoutDefault from './LayoutDefault';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from './components/AuthContext';

// Interface for item details
interface ItemDetails {
  id: number;
  name: string;
  type: 'Lost' | 'Found';
  reportedBy: string;
  date: string;
  image: string;
  description: string;
  location: string;
}

const ItemPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Parse query parameters to get item ID and type
  useEffect(() => {
    // Get query parameters from the URL
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    
    if (!id || !type) {
      setError('Missing item information');
      setLoading(false);
      return;
    }
    
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch item details from the backend
        const response = await fetch('./Backend/getItems.php', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch item details (Status: ${response.status})`);
        }
        
        const data = await response.json();
        
        // Find the specific item by ID and type
        const foundItem = data.find((item: any) => 
          item.id.toString() === id && item.type.toLowerCase() === type.toLowerCase()
        );
        
        if (foundItem) {
          setItem(foundItem);
        } else {
          setError('Item not found');
        }
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError('Failed to load item details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [location.search]);
  
  // Handle claim button click
  const handleClaim = () => {
    navigate(`/claim?item=${item?.id}&type=${item?.type.toLowerCase()}`);
  };
  
  // Go back to previous page
  const handleBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <LayoutDefault>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </LayoutDefault>
    );
  }
  
  if (error || !item) {
    return (
      <LayoutDefault>
        <Paper sx={{ maxWidth: 800, margin: 'auto', p: 3, mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Item not found'}
          </Alert>
          <Button variant="contained" onClick={handleBack}>
            Go Back
          </Button>
        </Paper>
      </LayoutDefault>
    );
  }
  
  return (
    <LayoutDefault>
      <Paper sx={{ maxWidth: 900, margin: 'auto', p: 3, mt: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button variant="outlined" onClick={handleBack}>
            Back
          </Button>
          <Chip 
            label={item.type} 
            color={item.type === 'Lost' ? 'error' : 'success'} 
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Grid container spacing={4}>
          {/* Item Image */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                src={item.image ? `./Backend/${item.image}` : "./no-image.png"}
                alt={item.name}
                sx={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: 2,
                  boxShadow: 2,
                  backgroundColor: '#f5f5f5',
                  objectFit: 'contain',
                  minHeight: '300px'
                }}
              />
            </Box>
          </Grid>
          
          {/* Item Details */}
          <Grid item xs={12} md={7}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {item.name}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {item.location}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date {item.type === 'Lost' ? 'Lost' : 'Found'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reported By
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {item.reportedBy}
                </Typography>
              </Grid>
            </Grid>
            
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {item.description}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {item.type === 'Found' && isAuthenticated && (
                <Button 
                  variant="contained" 
                  onClick={handleClaim}
                  sx={{ fontWeight: 'bold', py: 1.5, px: 4 }}
                >
                  Claim This Item
                </Button>
              )}
              
              {(!isAuthenticated && item.type === 'Found') && (
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/login')}
                  sx={{ fontWeight: 'bold', py: 1.5, px: 4 }}
                >
                  Login to Claim
                </Button>
              )}
              
              <Button 
                variant="outlined" 
                onClick={() => navigate('/report-lost-item')}
                sx={{ py: 1.5 }}
              >
                Report a Lost Item
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </LayoutDefault>
  );
};

export default ItemPage;