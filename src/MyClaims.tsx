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
  Button
} from '@mui/material';
import LayoutDefault from './LayoutDefault';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';

// Interface for claim data
interface ClaimData {
  id: number;
  user_id: number;
  item_id: number;
  claim_type: 'lost' | 'found';
  proof_of_ownership: string;
  additional_details?: string;
  approved: number | null;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
  
  // Item details
  item_name?: string;
  name?: string; // For lost items
  description?: string;
  location_found?: string;
  last_seen_location?: string;
  image?: string;
  file_path?: string; // For lost items
}

function MyClaims() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch user's claims
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchClaims = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('./Backend/myClaims.php', {
          credentials: 'include' // Include cookies for session
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setClaims(data.claims || []);
        } else {
          setError(data.message || 'Failed to load your claims');
        }
      } catch (error) {
        console.error('Error fetching claims:', error);
        setError('Failed to load your claims. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClaims();
  }, [isAuthenticated]);
  
  // Get status chip color and label
  const getStatusChip = (approved: number | null) => {
    if (approved === 1) {
      return <Chip label="Approved" color="success" />;
    } else if (approved === 0) {
      return <Chip label="Denied" color="error" />;
    } else {
      return <Chip label="Pending" color="warning" />;
    }
  };

  // Get image URL based on claim type
  const getImageUrl = (claim: ClaimData) => {
    if (claim.claim_type === 'found' && claim.image) {
      return `./Backend/${encodeURI(claim.image)}`;
    } else if (claim.claim_type === 'lost' && claim.file_path) {
      return `./Backend/${encodeURI(claim.file_path)}`;
    }
    return './no-image.png'; // Use the 100x100 default image
  };

  // Get item name based on claim type
  const getItemName = (claim: ClaimData) => {
    return claim.claim_type === 'found' 
      ? claim.item_name || "Unknown Item"
      : claim.name || "Unknown Item";
  };

  // If still loading auth, show loading spinner
  if (authLoading) {
    return (
      <LayoutDefault>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </LayoutDefault>
    );
  }

  // If not authenticated, don't render anything (redirect will handle it)
  if (!isAuthenticated) {
    return null;
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <LayoutDefault>
      <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
        <Typography variant="h3" sx={{ mb: 3, textAlign: 'center' }}>
          My Claims
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : claims.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>You haven't submitted any claims yet</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/claim')}
            >
              Browse Items to Claim
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {claims.map((claim) => (
              <Grid item xs={12} key={claim.id}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Chip 
                        label={claim.claim_type.toUpperCase()} 
                        color={claim.claim_type === 'lost' ? 'primary' : 'secondary'} 
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Claim ID: {claim.id} | Submitted: {formatDate(claim.created_at)}
                      </Typography>
                    </Box>
                    {getStatusChip(claim.approved)}
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={3}>
                    {/* Item Info */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="180"
                          image={getImageUrl(claim)}
                          alt={getItemName(claim)}
                          sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
                        />
                        <CardContent>
                          <Typography variant="h6">{getItemName(claim)}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {claim.description || "No description available"}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* Claim Details */}
                    <Grid item xs={12} sm={6} md={8}>
                      <Box>
                        <Typography variant="h6" gutterBottom>Claim Details</Typography>
                        
                        <Typography variant="subtitle2">Your Proof of Ownership:</Typography>
                        <Typography variant="body2" paragraph sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 1 }}>
                          {claim.proof_of_ownership}
                        </Typography>
                        
                        {claim.additional_details && (
                          <>
                            <Typography variant="subtitle2">Additional Details You Provided:</Typography>
                            <Typography variant="body2" paragraph sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 1 }}>
                              {claim.additional_details}
                            </Typography>
                          </>
                        )}
                        
                        {claim.approved === 0 && claim.rejection_reason && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            <Typography variant="subtitle2">Reason for Denial:</Typography>
                            <Typography variant="body2">{claim.rejection_reason}</Typography>
                          </Alert>
                        )}
                        
                        {claim.approved === 1 && (
                          <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="subtitle2">Next Steps:</Typography>
                            <Typography variant="body2">
                              Your claim has been approved! Please visit our office to collect your item.
                              Bring your ID and reference your claim ID #{claim.id}.
                            </Typography>
                          </Alert>
                        )}
                        
                        {claim.approved === null && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="subtitle2">Claim Status:</Typography>
                            <Typography variant="body2">
                              Your claim is currently under review. We'll notify you once a decision has been made.
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </LayoutDefault>
  );
}

export default MyClaims;