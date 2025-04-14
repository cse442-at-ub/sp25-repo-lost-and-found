import React, { useEffect, useState } from "react";
import LayoutDefault from "./LayoutDefault";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
} from "@mui/material";

const API_URL = "./Backend/adminRetrieve.php";
const UPDATE_STATUS_URL = "./Backend/updateRetrieveStatus.php";
const IMAGE_BASE_URL = "./Backend/";

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
  const [retrievals, setRetrievals] = useState<RetrieveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RetrieveRequest | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchRetrievals();
  }, []);

  const fetchRetrievals = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.success) {
        setRetrievals(data.data);
      } else {
        setError(data.error || 'Failed to fetch retrieval requests');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Error:', err);
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

  if (loading) {
    return (
      <LayoutDefault>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
      </LayoutDefault>
    );
  }

  if (error) {
    return (
      <LayoutDefault>
        <Alert severity="error" style={{ margin: 20 }}>
          {error}
        </Alert>
      </LayoutDefault>
    );
  }

  return (
    <LayoutDefault>
      <Typography variant="h4" gutterBottom style={{ padding: 20 }}>
        Items Waiting for Retrieval
      </Typography>
      
      <TableContainer component={Paper} style={{ margin: 20 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Details</TableCell>
              <TableCell>Claimant Information</TableCell>
              <TableCell>Delivery Information</TableCell>
              <TableCell>Additional Details</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {retrievals.map((retrieval) => (
              <TableRow key={retrieval.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CardMedia
                        component="img"
                        src={retrieval.item_image ? `${IMAGE_BASE_URL}${encodeURI(retrieval.item_image)}` : `${IMAGE_BASE_URL}default-item.png`}
                        alt={retrieval.item_name}
                        style={{ width: 50, height: 50 }}
                      />
                      <Typography variant="subtitle1">{retrieval.item_name}</Typography>
                    </Box>
                    <Typography variant="body2"><strong>Description:</strong> {retrieval.item_description}</Typography>
                    <Typography variant="body2"><strong>Found at:</strong> {retrieval.location_found}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2"><strong>Name:</strong> {retrieval.name}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {retrieval.email}</Typography>
                    <Typography variant="body2"><strong>User ID:</strong> {retrieval.user_id}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2"><strong>Method:</strong> {retrieval.delivery_method}</Typography>
                    {retrieval.delivery_method === 'pickup' ? (
                      <Typography variant="body2"><strong>Pickup Location:</strong> {retrieval.pickup_location}</Typography>
                    ) : (
                      <>
                        <Typography variant="body2"><strong>Address:</strong> {retrieval.address}</Typography>
                        <Typography variant="body2"><strong>City/County:</strong> {retrieval.county}</Typography>
                        <Typography variant="body2"><strong>State:</strong> {retrieval.state}</Typography>
                        <Typography variant="body2"><strong>ZIP:</strong> {retrieval.zipcode}</Typography>
                      </>
                    )}
                    {retrieval.preferred_time && (
                      <Typography variant="body2"><strong>Preferred Time:</strong> {new Date(retrieval.preferred_time).toLocaleString()}</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2"><strong>Status:</strong></Typography>
                      <Chip 
                        label={retrieval.status || 'Pending'} 
                        color={getStatusColor(retrieval.status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2"><strong>Submitted:</strong> {new Date(retrieval.submitted_at).toLocaleString()}</Typography>
                    {retrieval.additional_instructions && (
                      <Typography variant="body2"><strong>Instructions:</strong> {retrieval.additional_instructions}</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={retrieval.status || 'pending'}
                      onChange={(e) => updateStatus(retrieval, e.target.value)}
                      size="small"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default AdminRetrieve;