import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  Typography, 
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// No need to import CSS file
import LayoutDefault from './LayoutDefault';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';

// Interface for found items
interface FoundItem {
  id: number;
  item_name: string;
  location_found: string;
  description: string;
  image?: string;
  date_found?: string;
  category?: string;
}

// Interface for claim form data
interface ClaimData {
  itemId: number;
  proofOfOwnership: string;
  additionalDetails: string;
}

function ClaimPage() {
    // Create keyframes for animations
    const fadeIn = {
        '@keyframes fadeIn': {
            from: {
                opacity: 0,
                transform: 'translateY(20px)'
            },
            to: {
                opacity: 1,
                transform: 'translateY(0)'
            }
        }
    };

    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null);
    const [claimData, setClaimData] = useState<ClaimData>({
        itemId: 0,
        proofOfOwnership: '',
        additionalDetails: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info' as 'error' | 'warning' | 'info' | 'success'
    });

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            setSnackbar({
                open: true,
                message: 'Please log in to view and claim items',
                severity: 'warning'
            });
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Fetch found items from the server
    useEffect(() => {
        if (!isAuthenticated) return;
        
        const fetchFoundItems = async () => {
            try {
                setLoading(true);
                // Fetch items from the backend
                const response = await fetch('./Backend/getFoundItems.php', {
                    method: 'GET',
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch items (Status: ${response.status})`);
                }
                
                // Get the response text first to check if it's valid JSON
                const responseText = await response.text();
                
                // Try to parse as JSON
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Response is not valid JSON:', responseText);
                    throw new Error('Server returned an invalid response');
                }
                
                if (data.success) {
                    setFoundItems(data.items || []);
                } else {
                    throw new Error(data.message || 'Unknown error occurred');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error('Error fetching items:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFoundItems();
    }, [isAuthenticated]);

    // Handle item selection
    const handleSelectItem = (item: FoundItem) => {
        setSelectedItem(item);
        setClaimData({
            itemId: item.id,
            proofOfOwnership: '',
            additionalDetails: ''
        });
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setClaimData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validate claim form
    const isFormValid = () => {
        return (
            selectedItem !== null && 
            claimData.proofOfOwnership.trim().length >= 10
        );
    };

    // Handle claim submission
    const handleSubmitClaim = async () => {
        if (!isAuthenticated) {
            setSnackbar({
                open: true,
                message: 'Please log in to submit a claim',
                severity: 'error'
            });
            navigate('/login');
            return;
        }

        if (!isFormValid()) {
            setSnackbar({
                open: true,
                message: 'Please provide necessary details before claiming an item',
                severity: 'error'
            });
            return;
        }

        try {
            // Show loading indicator
            setLoading(true);
            
            const response = await fetch('./Backend/submitClaims.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    item_id: claimData.itemId,
                    claim_type: 'found', // This is a claim for a found item
                    proof_of_ownership: claimData.proofOfOwnership,
                    additional_details: claimData.additionalDetails
                }),
                credentials: 'include'
            });
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            // Get the response text first to check if it's actually JSON
            const responseText = await response.text();
            
            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Response is not valid JSON:', responseText);
                throw new Error('Server returned an invalid response. Please check server logs.');
            }
            
            if (data.success) {
                setSnackbar({
                    open: true,
                    message: 'Your claim has been submitted successfully',
                    severity: 'success'
                });
                // Reset form and selection after successful submission
                setSelectedItem(null);
                setClaimData({
                    itemId: 0,
                    proofOfOwnership: '',
                    additionalDetails: ''
                });
            } else {
                setSnackbar({
                    open: true,
                    message: data.message || 'Failed to submit claim',
                    severity: 'error'
                });
            }
        } catch (err) {
            console.error('Error submitting claim:', err);
            setSnackbar({
                open: true,
                message: err instanceof Error ? err.message : 'An unexpected error occurred while submitting your claim',
                severity: 'error'
            });
        } finally {
            // Hide loading indicator
            setLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };
    
    // Filter items based on search term
    const filteredItems = foundItems.filter(item => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            (item.item_name && item.item_name.toLowerCase().includes(searchTermLower)) ||
            (item.location_found && item.location_found.toLowerCase().includes(searchTermLower)) ||
            (item.description && item.description.toLowerCase().includes(searchTermLower)) ||
            (item.category && item.category.toLowerCase().includes(searchTermLower))
        );
    });

    // Handle snackbar close
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // If not authenticated, show login message
    if (!authLoading && !isAuthenticated) {
        return (
            <LayoutDefault>
                <Paper sx={{ padding: 4, maxWidth: 600, margin: 'auto', marginTop: 4 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Authentication Required
                    </Typography>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        You need to be logged in to view and claim items.
                    </Alert>
                    <Box display="flex" justifyContent="center">
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => navigate('/login')}
                            size="large"
                        >
                            Go to Login
                        </Button>
                    </Box>
                </Paper>
            </LayoutDefault>
        );
    }

    // Display loading indicator
    if (loading) {
        return (
            <LayoutDefault>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                    <Typography variant="h6" sx={{ ml: 2 }}>Loading items...</Typography>
                </Box>
            </LayoutDefault>
        );
    }

    // Display error message
    if (error) {
        return (
            <LayoutDefault>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Alert severity="error" sx={{ maxWidth: 600 }}>
                        <Typography variant="h6">{error}</Typography>
                        <Typography>
                            There was a problem loading the found items. Please try again later.
                        </Typography>
                    </Alert>
                </Box>
            </LayoutDefault>
        );
    }

    return (
        <LayoutDefault>
            <Box sx={{ 
                maxWidth: 1200, 
                margin: 'auto', 
                padding: 3,
                animation: 'fadeIn 0.5s ease-out'
            }}>
                <Typography 
                    variant="h3" 
                    align="center" 
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                >
                    Claim an Item
                </Typography>
                <Typography 
                    variant="h6" 
                    align="center" 
                    gutterBottom 
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Browse found items and claim what belongs to you
                </Typography>

                <Divider sx={{ my: 3 }} />
                
                {/* Search Bar */}
                <Paper 
                    elevation={2} 
                    sx={{ 
                        p: 2, 
                        mb: 4, 
                        borderRadius: 2,
                        backgroundColor: '#f9f9f9'
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder="Search by item name, location, description..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        variant="outlined"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: { 
                                borderRadius: 2,
                                bgcolor: 'white',
                                '&:hover': {
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }
                            }
                        }}
                    />
                </Paper>

                {/* If no items found */}
                {foundItems.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No found items are currently available for claiming.
                    </Alert>
                )}
                
                {/* If no search results */}
                {foundItems.length > 0 && filteredItems.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No items match your search criteria. Try different keywords.
                    </Alert>
                )}

                {/* Search result counter */}
                {!selectedItem && foundItems.length > 0 && (
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Showing {filteredItems.length} of {foundItems.length} items
                        </Typography>
                        {searchTerm && (
                            <Button 
                                size="small" 
                                variant="text" 
                                onClick={() => setSearchTerm('')}
                                sx={{ ml: 2 }}
                            >
                                Clear Search
                            </Button>
                        )}
                    </Box>
                )}
                
                {/* Two-column layout when an item is selected */}
                {selectedItem ? (
                    <Grid container spacing={4}>
                        {/* Item details column */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ 
                                p: 3, 
                                height: '100%',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                ...fadeIn, // Apply the keyframe animation
                                animation: 'fadeIn 0.5s ease-out forwards',
                                opacity: 0 // Start with opacity 0, animation will bring it to 1
                            }}>
                                <Typography variant="h5" gutterBottom sx={{ 
                                    fontWeight: 600,
                                    pb: 1,
                                    borderBottom: '1px solid #eee'
                                }}>
                                    Selected Item
                                </Typography>
                                
                                <Box sx={{ 
                                    mb: 2, 
                                    textAlign: 'center',
                                    mt: 3
                                }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={selectedItem.image ? `./Backend/${selectedItem.image}` : "./no-image.png"}
                                        alt={selectedItem.item_name}
                                        sx={{ 
                                            objectFit: 'contain', 
                                            mb: 2,
                                            borderRadius: 1,
                                            bgcolor: '#f5f5f5',
                                            p: 2,
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                        }}
                                    />
                                </Box>
                                
                                <Typography variant="h6">
                                    {selectedItem.item_name}
                                </Typography>
                                
                                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                    <strong>Found at:</strong> {selectedItem.location_found}
                                </Typography>
                                
                                {selectedItem.date_found && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Date Found:</strong> {selectedItem.date_found}
                                    </Typography>
                                )}
                                
                                {selectedItem.category && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Category:</strong> {selectedItem.category}
                                    </Typography>
                                )}
                                
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    <strong>Description:</strong> {selectedItem.description}
                                </Typography>
                                
                                <Button 
                                    variant="outlined" 
                                    color="secondary" 
                                    sx={{ mt: 3 }}
                                    onClick={() => setSelectedItem(null)}
                                >
                                    Select Different Item
                                </Button>
                            </Paper>
                        </Grid>
                        
                        {/* Claim form column */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ 
                                p: 3, 
                                height: '100%',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                ...fadeIn, // Apply the keyframe animation
                                animation: 'fadeIn 0.5s ease-out forwards',
                                animationDelay: '0.2s',
                                opacity: 0 // Start with opacity 0, animation will bring it to 1
                            }}>
                                <Typography variant="h5" gutterBottom sx={{ 
                                    fontWeight: 600,
                                    pb: 1,
                                    borderBottom: '1px solid #eee'
                                }}>
                                    Submit Claim
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ 
                                    mb: 3,
                                    mt: 2,
                                    fontStyle: 'italic'
                                }}>
                                    Please provide details to verify your ownership of this item.
                                </Typography>
                                
                                <TextField
                                    fullWidth
                                    required
                                    label="Proof of Ownership"
                                    name="proofOfOwnership"
                                    value={claimData.proofOfOwnership}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={4}
                                    placeholder="Describe specific details about the item that only the owner would know (serial number, distinctive marks, contents, etc.)"
                                    error={claimData.proofOfOwnership.trim().length > 0 && claimData.proofOfOwnership.trim().length < 10}
                                    helperText={claimData.proofOfOwnership.trim().length > 0 && claimData.proofOfOwnership.trim().length < 10 ? "Please provide at least 10 characters" : ""}
                                    sx={{ 
                                        mb: 3,
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                                
                                <TextField
                                    fullWidth
                                    label="Additional Details (Optional)"
                                    name="additionalDetails"
                                    value={claimData.additionalDetails}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    placeholder="Any additional information that might help verify your claim"
                                    sx={{ mb: 3 }}
                                />
                                
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    disabled={!isFormValid()}
                                    onClick={handleSubmitClaim}
                                    sx={{ 
                                        mt: 3,
                                        py: 1.5,
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                                            transform: 'translateY(-2px)'
                                        },
                                        '&:active': {
                                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.4)',
                                            transform: 'translateY(1px)'
                                        },
                                        '&:disabled': {
                                            bgcolor: 'rgba(0, 0, 0, 0.12)',
                                            boxShadow: 'none'
                                        }
                                    }}
                                >
                                    SUBMIT CLAIM
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                ) : (
                    /* Grid of items to select from */
                    <Grid container spacing={3}>
                        {filteredItems.map((item) => (
                            <Grid item key={item.id} xs={12} sm={6} md={4}>
                                <Card 
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                            boxShadow: 6
                                        },
                                        borderRadius: 2,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={item.image ? `./Backend/${item.image}` : "./no-image.png"}
                                        alt={item.item_name}
                                        sx={{ 
                                            objectFit: 'contain',
                                            backgroundColor: '#f5f5f5',
                                            padding: 2
                                        }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" gutterBottom>
                                            {item.item_name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Found at:</strong> {item.location_found}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                                            {item.description && item.description.length > 100 
                                                ? `${item.description.substring(0, 100)}...` 
                                                : item.description}
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            fullWidth
                                            onClick={() => handleSelectItem(item)}
                                        >
                                            Claim This Item
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Feedback Snackbar */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </LayoutDefault>
    );
}

export default ClaimPage;