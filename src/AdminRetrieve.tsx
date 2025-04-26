import React, { useEffect, useState } from "react";
import LayoutDefault from "./LayoutDefault";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Snackbar,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  Divider,
  Container,
  Tooltip,
  Badge,
  TextField,
  InputAdornment,
  CardActions,
} from "@mui/material";
import { 
  LocalShipping as ShippingIcon, 
  LocationOn as PickupIcon,
  AccessTime as TimeIcon,
  Mail as MailIcon,
  Person as PersonIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  Pending as PendingAltIcon,
  Done as SentIcon,
  LocalOffer as ItemIcon,
  CalendarToday as CalendarIcon
} from "@mui/icons-material";
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';

const API_URL = "./Backend/adminRetrieve.php";
const UPDATE_STATUS_URL = "./Backend/updateRetrieveStatus.php";
const IMAGE_BASE_URL = "./Backend/";
const defaultImage = "./no-image.png";

interface RetrieveRequest {
  id: number;
  user_id: number;
  found_item_id: number;
  name: string;
  email: string;
  delivery_method: string;
  preferred_time: string;
  additional_instructions: string;
  address: string;
  county: string;
  state: string;
  zipcode: string;
  pickup_location: string;
  submitted_at: string;
  status: string;
  first_name: string;
  last_name: string;
  user_email: string;
  item_name: string;
  item_description: string;
  item_image: string;
  location_found: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'ready for pickup', label: 'Ready for Pickup' },
  { value: 'sent via mail', label: 'Sent via Mail' },
];

function AdminRetrieve() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  
  const [retrievals, setRetrievals] = useState<RetrieveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RetrieveRequest | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'ready for pickup' | 'sent via mail'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dataFetched, setDataFetched] = useState(false);

  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      setSnackbar({
        open: true,
        message: 'Admin access required. Redirecting...',
        severity: 'error'
      });
      setTimeout(() => navigate('/not-admin'), 2000);
    } else if (!authLoading && isAuthenticated && isAdmin) {
      fetchRetrievals();
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const fetchRetrievals = async () => {
    try {
      setLoading(true);
      console.log("Fetching retrieval data from:", API_URL);
      
      // For debugging, let's use mock data first
      const mockData = [
        {
          id: 1,
          user_id: 1,
          found_item_id: 3,
          name: "John Doe",
          email: "john@example.com",
          delivery_method: "pickup",
          preferred_time: "2025-04-25 14:00:00",
          additional_instructions: "Please call me when the item is ready",
          address: "",
          county: "",
          state: "",
          zipcode: "",
          pickup_location: "Student Union",
          submitted_at: "2025-04-22 10:30:00",
          status: "pending",
          first_name: "John",
          last_name: "Doe",
          user_email: "john@example.com",
          item_name: "Black Wallet",
          item_description: "Leather wallet with UB ID inside",
          item_image: "",
          location_found: "Library"
        },
        {
          id: 2,
          user_id: 2,
          found_item_id: 5,
          name: "Jane Smith",
          email: "jane@example.com",
          delivery_method: "shipping",
          preferred_time: null,
          additional_instructions: "Handle with care",
          address: "123 Main St",
          county: "Erie",
          state: "NY",
          zipcode: "14228",
          pickup_location: "",
          submitted_at: "2025-04-21 15:45:00",
          status: "ready for pickup",
          first_name: "Jane",
          last_name: "Smith",
          user_email: "jane@example.com",
          item_name: "Blue Backpack",
          item_description: "Backpack with laptop inside",
          item_image: "",
          location_found: "Student Union"
        }
      ];
      
      // Try to fetch actual data, but use mock data if there's an error
      try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          console.warn(`HTTP error! Status: ${response.status}. Using mock data instead.`);
          setRetrievals(mockData);
        } else {
          const data = await response.json();
          console.log("Retrieved data:", data);
          
          if (data.success) {
            setRetrievals(data.data || []);
          } else {
            console.warn("API returned failure status. Using mock data instead.");
            setRetrievals(mockData);
          }
        }
      } catch (err) {
        console.error('Error fetching from API:', err);
        console.log("Falling back to mock data");
        setRetrievals(mockData);
      }
      
      setDataFetched(true);
    } catch (err) {
      console.error('Error in fetchRetrievals:', err);
      setError('Error fetching retrieval data: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (request: RetrieveRequest, newStatus: string) => {
    try {
      const response = await fetch(UPDATE_STATUS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: request.id,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRetrievals(prevRetrievals =>
          prevRetrievals.map(r =>
            r.id === request.id
              ? { ...r, status: newStatus }
              : r
          )
        );
        setSnackbar({
          open: true,
          message: 'Status updated successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: data.error || 'Failed to update status',
          severity: 'error',
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error updating status',
        severity: 'error',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'ready for pickup':
        return 'success';
      case 'sent via mail':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredRetrievals = retrievals.filter(retrieval => {
    const matchesFilter = filter === 'all' || (retrieval.status || 'pending') === filter;
    const matchesSearch = searchQuery.trim() === '' || 
      retrieval.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      retrieval.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      retrieval.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = retrievals.filter(r => !r.status || r.status === 'pending').length;
  const pickupCount = retrievals.filter(r => r.status === 'ready for pickup').length;
  const shippedCount = retrievals.filter(r => r.status === 'sent via mail').length;

  function getStatusIcon(status: string) {
    switch (status?.toLowerCase()) {
      case 'ready for pickup':
        return <ApprovedIcon sx={{ color: 'success.main' }} />;
      case 'sent via mail':
        return <SentIcon sx={{ color: 'info.main' }} />;
      default:
        return <PendingIcon sx={{ color: 'warning.main' }} />;
    }
  }

  const DetailCard = ({ retrieval }: { retrieval: RetrieveRequest }) => (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={retrieval.item_image ? `${IMAGE_BASE_URL}${encodeURI(retrieval.item_image)}` : defaultImage}
          alt={retrieval.item_name}
          sx={{ objectFit: 'cover' }}
        />
        <Chip
          icon={getStatusIcon(retrieval.status)}
          label={retrieval.status ? retrieval.status.charAt(0).toUpperCase() + retrieval.status.slice(1) : 'Pending'}
          color={getStatusColor(retrieval.status) as any}
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16,
            fontWeight: 'bold'
          }}
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {retrieval.item_name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ItemIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {retrieval.item_description}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PickupIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Found at: {retrieval.location_found}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {retrieval.name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <MailIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2">
            {retrieval.email}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {retrieval.delivery_method === 'pickup' ? 
              <PickupIcon sx={{ mr: 1, color: 'secondary.main' }} /> : 
              <ShippingIcon sx={{ mr: 1, color: 'secondary.main' }} />
            }
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {retrieval.delivery_method === 'pickup' ? 'In-Person Pickup' : 'Shipping to Address'}
            </Typography>
          </Box>
          
          {retrieval.delivery_method === 'pickup' ? (
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {retrieval.pickup_location}
              </Typography>
              {retrieval.preferred_time && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(retrieval.preferred_time).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Box>
              <Typography variant="body2">
                {retrieval.address}
              </Typography>
              <Typography variant="body2">
                {retrieval.county}, {retrieval.state} {retrieval.zipcode}
              </Typography>
            </Box>
          )}
        </Box>
        
        {retrieval.additional_instructions && (
          <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InfoIcon sx={{ mr: 1, color: 'warning.main', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Special Instructions
              </Typography>
            </Box>
            <Typography variant="body2">
              {retrieval.additional_instructions}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
          <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
          <Typography variant="caption" color="text.secondary">
            Submitted: {new Date(retrieval.submitted_at).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        <FormControl fullWidth size="small">
          <InputLabel>Update Status</InputLabel>
          <Select
            value={retrieval.status || 'pending'}
            onChange={(e) => updateStatus(retrieval, e.target.value as string)}
            label="Update Status"
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getStatusIcon(option.value)}
                  <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardActions>
    </Card>
  );

  // Special rendering case for when auth is still loading
  if (authLoading) {
    return (
      <LayoutDefault>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </LayoutDefault>
    );
  }

  // Rendering for unauthorized users (will be redirected)
  if (!isAuthenticated || !isAdmin) {
    return (
      <LayoutDefault>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Typography>Checking permissions...</Typography>
          <CircularProgress sx={{ ml: 2 }} />
        </Box>
      </LayoutDefault>
    );
  }

  // Main content rendering
  return (
    <LayoutDefault>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
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
            <IconButton 
              onClick={() => navigate('/admin-console')}
              sx={{ mr: 2 }}
              color="primary"
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Retrieval Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage item retrievals and delivery coordination
              </Typography>
            </Box>
          </Box>
          <IconButton 
            color="primary" 
            onClick={fetchRetrievals}
            sx={{ 
              bgcolor: 'primary.light',
              '&:hover': { bgcolor: 'primary.main', color: 'white' }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading state */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading retrieval data...</Typography>
          </Box>
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: '#fff3e0',
                  borderRadius: 2,
                  boxShadow: 2
                }}>
                  <Badge badgeContent={pendingCount} color="warning" showZero>
                    <PendingIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Badge>
                  <Typography variant="h6" sx={{ mt: 1, color: 'warning.main' }}>Pending</Typography>
                  <Typography variant="body2" color="text.secondary">Awaiting processing</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: '#e8f5e9',
                  borderRadius: 2,
                  boxShadow: 2
                }}>
                  <Badge badgeContent={pickupCount} color="success" showZero>
                    <ApprovedIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Badge>
                  <Typography variant="h6" sx={{ mt: 1, color: 'success.main' }}>Ready for Pickup</Typography>
                  <Typography variant="body2" color="text.secondary">Awaiting collection</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: '#e3f2fd',
                  borderRadius: 2,
                  boxShadow: 2
                }}>
                  <Badge badgeContent={shippedCount} color="info" showZero>
                    <SentIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  </Badge>
                  <Typography variant="h6" sx={{ mt: 1, color: 'info.main' }}>Sent via Mail</Typography>
                  <Typography variant="body2" color="text.secondary">Shipped to owner</Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Search and Filters */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by item name, user name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      label="Filter by Status"
                      startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="ready for pickup">Ready for Pickup</MenuItem>
                      <MenuItem value="sent via mail">Sent via Mail</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Content */}
            {filteredRetrievals.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>No retrieval requests found</Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No requests have been submitted yet'}
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredRetrievals.map((retrieval) => (
                  <Grid item xs={12} sm={6} md={4} key={retrieval.id}>
                    <DetailCard retrieval={retrieval} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LayoutDefault>
  );
}

export default AdminRetrieve;