import React, { useEffect, useState } from "react";
import LayoutDefault from "./LayoutDefault";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Paper,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from "@mui/material";
import { useNavigate } from "react-router";
import { useAuth } from "./components/AuthContext";

// Base URLs for API endpoints and images
const API_URL = "./Backend/adminClaim.php";
const APPROVAL_URL = "./Backend/setClaimApproved.php";
const IMAGE_BASE_URL = "./Backend/";

// Interface for claim data
interface ClaimData {
  claim_id: number;
  user_id: number;
  item_id: number;
  claim_type: 'lost' | 'found';
  proof_of_ownership: string;
  additional_details?: string;
  approved: number | null;
  created_at: string;
  
  // User info
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  
  // Item info
  item_name?: string;
  name?: string; // For lost items
  description?: string;
  location_found?: string;
  last_seen_location?: string;
  image?: string;
  file_path?: string; // For lost items
}

function AdminClaim() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "error" | "warning" | "info" | "success"
  });
  
  // State for rejection dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Check authentication and admin status
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/not-admin');
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Fetch claims data
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL, {
          credentials: 'include' // Include cookies for session
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Filter claims where 'approved' is NULL (pending)
        const pendingClaims = data.filter((claim: ClaimData) => claim.approved === null);
        setClaims(pendingClaims);
      } catch (error) {
        console.error("Error fetching claims:", error);
        setError("Failed to load claims. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [isAuthenticated, isAdmin]);

  // Handle approval/denial of claims
  const handleApproval = async (id: number, approved: number) => {
    try {
      const response = await fetch(APPROVAL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          approved,
          reason: approved === 0 ? rejectionReason : undefined
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove the claim from UI after approval/denial
        setClaims((prevClaims) => prevClaims.filter((claim) => claim.claim_id !== id));
        
        setSnackbar({
          open: true,
          message: `Claim ${approved === 1 ? 'approved' : 'denied'} successfully`,
          severity: "success"
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to update claim status",
          severity: "error"
        });
      }
    } catch (error) {
      console.error("Error updating claim:", error);
      setSnackbar({
        open: true,
        message: "An error occurred while processing the claim",
        severity: "error"
      });
    } finally {
      // Reset rejection reason and close dialog if open
      setRejectionReason("");
      setDialogOpen(false);
      setSelectedClaimId(null);
    }
  };

  // Open rejection dialog
  const openRejectDialog = (claimId: number) => {
    setSelectedClaimId(claimId);
    setDialogOpen(true);
  };

  // Close rejection dialog
  const closeRejectDialog = () => {
    setDialogOpen(false);
    setRejectionReason("");
    setSelectedClaimId(null);
  };

  // Submit rejection with reason
  const submitRejection = () => {
    if (selectedClaimId !== null) {
      handleApproval(selectedClaimId, 0);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get image URL based on claim type
  const getImageUrl = (claim: ClaimData) => {
    if (claim.claim_type === 'found' && claim.image) {
      return `${IMAGE_BASE_URL}${encodeURI(claim.image)}`;
    } else if (claim.claim_type === 'lost' && claim.file_path) {
      return `${IMAGE_BASE_URL}${encodeURI(claim.file_path)}`;
    }
    return './no-image.png'; // Use the 100x100 default image
  };

  // Get item name based on claim type
  const getItemName = (claim: ClaimData) => {
    return claim.claim_type === 'found' 
      ? claim.item_name || "Unknown Item"
      : claim.name || "Unknown Item";
  };

  // Get location based on claim type
  const getLocation = (claim: ClaimData) => {
    return claim.claim_type === 'found'
      ? claim.location_found || "Unknown location"
      : claim.last_seen_location || "Unknown location";
  };

  // If still loading auth, show loading
  if (authLoading) {
    return (
      <LayoutDefault>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </LayoutDefault>
    );
  }

  // If not admin, don't render anything (redirect should happen)
  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    return null;
  }

  return (
    <LayoutDefault>
      <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
        <Typography variant="h3" sx={{ mb: 3, textAlign: 'center' }}>Admin Claim Review</Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : claims.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">There are no pending claims to review</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {claims.map((claim) => (
              <React.Fragment key={claim.claim_id}>
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ 
                    p: 3,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    }
                  }}>
                    <Box sx={{ 
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Box>
                        <Chip 
                          label={claim.claim_type.toUpperCase()} 
                          color={claim.claim_type === 'lost' ? 'primary' : 'secondary'} 
                          sx={{ 
                            mr: 1,
                            fontWeight: 'bold',
                            px: 1
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Claim ID: {claim.claim_id} | Submitted: {new Date(claim.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Grid container spacing={3}>
                      {/* Item Info Column */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>Item Information</Typography>
                        <Card>
                          <CardMedia
                            component="img"
                            height="200"
                            image={getImageUrl(claim)}
                            alt="Item Image"
                            sx={{ 
                              objectFit: 'contain', 
                              bgcolor: '#f5f5f5',
                              borderRadius: '4px 4px 0 0'
                            }}
                          />
                          <CardContent>
                            <Typography variant="h6">{getItemName(claim)}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Location:</strong> {getLocation(claim)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {claim.description || "No description provided"}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Claimant Info Column */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>Claimant Information</Typography>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="body1">
                              <strong>Name:</strong> {claim.first_name} {claim.last_name}
                            </Typography>
                            <Typography variant="body1">
                              <strong>Email:</strong> {claim.email || "N/A"}
                            </Typography>
                            <Typography variant="body1">
                              <strong>Phone:</strong> {claim.phone || "N/A"}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                              User ID: {claim.user_id}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Claim Details Column */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>Claim Details</Typography>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="subtitle2">Proof of Ownership:</Typography>
                            <Typography variant="body2" paragraph sx={{ bgcolor: '#f9f9f9', p: 1, borderRadius: 1 }}>
                              {claim.proof_of_ownership}
                            </Typography>
                            
                            {claim.additional_details && (
                              <>
                                <Typography variant="subtitle2">Additional Details:</Typography>
                                <Typography variant="body2" paragraph sx={{ bgcolor: '#f9f9f9', p: 1, borderRadius: 1 }}>
                                  {claim.additional_details}
                                </Typography>
                              </>
                            )}
                            
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleApproval(claim.claim_id, 1)}
                                sx={{ 
                                  px: 3,
                                  py: 1,
                                  fontWeight: 'bold',
                                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                                  transition: 'all 0.3s',
                                  '&:hover': {
                                    boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                                    transform: 'translateY(-2px)'
                                  },
                                  '&:active': {
                                    boxShadow: '0 2px 8px rgba(46, 125, 50, 0.4)',
                                    transform: 'translateY(1px)'
                                  }
                                }}
                              >
                                APPROVE
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => openRejectDialog(claim.claim_id)}
                                sx={{ 
                                  px: 3,
                                  py: 1,
                                  fontWeight: 'bold',
                                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                                  transition: 'all 0.3s',
                                  '&:hover': {
                                    boxShadow: '0 6px 16px rgba(211, 47, 47, 0.4)',
                                    transform: 'translateY(-2px)'
                                  },
                                  '&:active': {
                                    boxShadow: '0 2px 8px rgba(211, 47, 47, 0.4)',
                                    transform: 'translateY(1px)'
                                  }
                                }}
                              >
                                DENY
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        )}
      </Box>

      {/* Rejection Reason Dialog */}
      <Dialog open={dialogOpen} onClose={closeRejectDialog}>
        <DialogTitle>Deny Claim</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for denying this claim. This reason will be shared with the claimant.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason for Denial"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={submitRejection} 
            color="error"
            disabled={rejectionReason.trim().length === 0}
          >
            Deny Claim
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdminClaim;