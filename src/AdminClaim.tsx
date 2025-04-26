import React, { useEffect, useState } from "react";
import LayoutDefault from "./LayoutDefault";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Typography,
  Tooltip,
  Fade,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';

const API_URL = "./Backend/adminClaim.php";
const APPROVAL_URL = "./Backend/setClaimApproved.php";
const IMAGE_BASE_URL = "./Backend/";

interface Claim {
  claim_id: number;
  user_id: number;
  item_id: number;
  proof_of_ownership: string;
  additional_details?: string;
  approved: number | null;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  item_name: string;
  description: string;
  location_found: string;
  image?: string;
}

function AdminClaim() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'error' | 'warning' | 'info' | 'success'
  });

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
      fetchClaims();
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter for pending claims (where approved is null)
      const pendingClaims = data.filter((claim: Claim) => claim.approved === null);
      setClaims(pendingClaims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      setSnackbar({
        open: true,
        message: 'Failed to load claims. Please try again later.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: number, approved: number) => {
    try {
      const response = await fetch(APPROVAL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the approved/rejected claim from the list
        setClaims((prevClaims) => prevClaims.filter((claim) => claim.claim_id !== id));
        
        setSnackbar({
          open: true,
          message: `Claim has been ${approved === 1 ? 'approved' : 'denied'} successfully`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Failed to update claim status',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error("Error updating claim:", error);
      setSnackbar({
        open: true,
        message: 'Error processing the request. Please try again.',
        severity: 'error'
      });
    }
  };

  if (authLoading || loading) {
    return (
      <LayoutDefault>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </LayoutDefault>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    // Will be redirected by the useEffect, show a loading state
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
      <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
        <Button 
          variant="outlined" 
          color="secondary"         
          onClick={() => navigate('/admin-console')}
          sx={{ mb: 3 }}
        >
          Back to Admin Console
        </Button>
        
        <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
          Pending Claims
        </Typography>

        {claims.length === 0 ? (
          <Paper sx={{ padding: 4, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ p: 6, textAlign: "center", color: "text.secondary" }}>
              🎉 All caught up! No pending claims to review.
            </Typography>
          </Paper>
        ) : (
          claims.map((claim) => (
            <Fade in key={claim.claim_id}>
              <Card
                elevation={6}
                sx={{
                  mb: 5,
                  p: 2,
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  background: "#fafafa",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: { xs: "100%", sm: 220 },
                    height: 220,
                    borderRadius: 3,
                    objectFit: "cover",
                    backgroundColor: "#f0f0f0",
                  }}
                  src={
                    claim.image
                      ? `${IMAGE_BASE_URL}${encodeURI(claim.image)}`
                      : `${IMAGE_BASE_URL}default-item.png`
                  }
                  alt="Item Image"
                />

                <Box sx={{ flex: 1 }}>
                  <CardContent sx={{ pb: 0 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {claim.item_name || "Unnamed Item"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Found by <strong>{claim.first_name} {claim.last_name}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {claim.description || `Found at ${claim.location_found || "Unknown location"}`}
                    </Typography>
                  </CardContent>

                  <Divider sx={{ my: 1 }} />

                  <Box px={2} pb={1}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                      Claimant Info
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#fff" }}>
                      <Typography variant="body2"><strong>Name:</strong> {claim.first_name || "N/A"} {claim.last_name || ""}</Typography>
                      <Typography variant="body2"><strong>Email:</strong> {claim.email || "N/A"}</Typography>
                      <Typography variant="body2"><strong>Phone:</strong> {claim.phone || "N/A"}</Typography>
                      <Typography variant="body2"><strong>Ownership Proof:</strong> {claim.proof_of_ownership || "N/A"}</Typography>
                      <Typography variant="body2"><strong>Additional Details:</strong> {claim.additional_details || "N/A"}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Requested At:</strong> {new Date(claim.created_at).toLocaleString()}
                      </Typography>
                    </Paper>
                  </Box>

                  <Stack direction="row" spacing={2} px={2} pt={2}>
                    <Tooltip title="Approve claim" arrow>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleApproval(claim.claim_id, 1)}
                        sx={{ minWidth: 120, borderRadius: 2 }}
                      >
                        Approve
                      </Button>
                    </Tooltip>

                    <Tooltip title="Deny claim" arrow>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleApproval(claim.claim_id, 0)}
                        sx={{ minWidth: 120, borderRadius: 2 }}
                      >
                        Deny
                      </Button>
                    </Tooltip>
                  </Stack>
                </Box>
              </Card>
            </Fade>
          ))
        )}
      </Box>
      
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LayoutDefault>
  );
}

export default AdminClaim;