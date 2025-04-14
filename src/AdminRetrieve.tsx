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
} from "@mui/material";

const API_URL = "./Backend/adminRetrieve.php";
const IMAGE_BASE_URL = "./Backend/";

interface RetrieveRequest {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  user_email: string;
  item_name: string;
  item_description: string;
  item_image: string;
  location_found: string;
  delivery_method: string;
  preferred_time: string;
  additional_instructions: string;
  address: string;
  county: string;
  state: string;
  zipcode: string;
  pickup_location: string;
  submitted_at: string;
}

function AdminRetrieve() {
  const [retrievals, setRetrievals] = useState<RetrieveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchRetrievals();
  }, []);

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
              <TableCell>Item</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Found Location</TableCell>
              <TableCell>Retrieved By</TableCell>
              <TableCell>Retrieval Method</TableCell>
              <TableCell>Retrieval Location</TableCell>
              <TableCell>Preferred Time</TableCell>
              <TableCell>Additional Instructions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {retrievals.map((retrieval) => (
              <TableRow key={retrieval.id}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CardMedia
                      component="img"
                      src={retrieval.item_image ? `${IMAGE_BASE_URL}${encodeURI(retrieval.item_image)}` : `${IMAGE_BASE_URL}default-item.png`}
                      alt={retrieval.item_name}
                      style={{ width: 50, height: 50, marginRight: 10 }}
                    />
                    {retrieval.item_name}
                  </div>
                </TableCell>
                <TableCell>{retrieval.item_description}</TableCell>
                <TableCell>{retrieval.location_found}</TableCell>
                <TableCell>{retrieval.first_name} {retrieval.last_name}</TableCell>
                <TableCell>{retrieval.delivery_method}</TableCell>
                <TableCell>
                  {retrieval.delivery_method === 'pickup' 
                    ? retrieval.pickup_location 
                    : `${retrieval.address}, ${retrieval.county}, ${retrieval.state} ${retrieval.zipcode}`}
                </TableCell>
                <TableCell>{new Date(retrieval.preferred_time).toLocaleString()}</TableCell>
                <TableCell>{retrieval.additional_instructions || 'None'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </LayoutDefault>
  );
}

export default AdminRetrieve;