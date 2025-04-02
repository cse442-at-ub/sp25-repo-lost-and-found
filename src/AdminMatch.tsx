import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Grid,
  Select,
  MenuItem,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Search, CheckCircle, Pending, Cancel } from '@mui/icons-material';
import LayoutDefault from './LayoutDefault';

interface Item {
  id: number;
  name: string;
  type: 'Lost' | 'Found';
  reportedBy: string;
  date: string;
  image: string;
  description: string;
  location: string;
  status: 'Matched' | 'Pending Confirmation' | 'No Match'; // Added status field
  actions: string; // Added actions field
}

const AdminMatch = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLost, setSelectedLost] = useState<number | null>(null);
  const [selectedFound, setSelectedFound] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [successful, setSuccessful] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('./Backend/getItems.php'); // Fetch items from the backend
  
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.toLowerCase());
  };

  const handleMatch = async () => {
    if (selectedLost && selectedFound) {
      try {
        setErrorMessage(null);
        const response = await fetch("./Backend/adminmatch.php", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lost_item_id: selectedLost,
            found_item_id: selectedFound,
          }),
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // If not JSON, get the text response to show the error
          const textResponse = await response.text();
          console.error("Non-JSON response:", textResponse);
          setSuccessful("error");
          setErrorMessage("Server returned an invalid response format. Please check server logs.");
          return;
        }

        const result = await response.json();

        if (result.success) {
          setOpenDialog(true);
          setSuccessful("success");
          // Update the status of matched items
          setItems(prevItems => prevItems.map(item => {
            if (item.id === selectedLost || item.id === selectedFound) {
              return { ...item, status: 'Matched' }; // Update status to Matched
            }
            return item;
          }));
        } else {
          setSuccessful("error");
          setErrorMessage(result.error || "Unknown error occurred");
        }
      } catch (error) {
        console.error("There was an error matching the items!", error);
        setSuccessful("error");
        setErrorMessage("Failed to process the response. There might be an issue with the server.");
      }
    } else {
      setErrorMessage("Please select both a lost item and a found item.");
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search) || item.reportedBy.toLowerCase().includes(search)
  );

  const lostItems = filteredItems.filter(item => item.type === 'Lost');
  const foundItems = filteredItems.filter(item => item.type === 'Found');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Matched': return <CheckCircle style={{ color: 'green' }} />;
      case 'Pending Confirmation': return <Pending style={{ color: 'goldenrod' }} />;
      case 'No Match': return <Cancel style={{ color: 'red' }} />;
      default: return null;
    }
  };

  return (
    <LayoutDefault>
      <Paper sx={{ padding: 4, width: '90%', margin: 'auto', marginTop: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Admin Lost & Found Match
        </Typography>

        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search items or users..."
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search color="action" sx={{ marginRight: 1 }} />,
          }}
          sx={{ marginBottom: 2 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f', textAlign: 'center' }}>Lost Items</Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto', borderRadius: 2, boxShadow: 3 }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#d32f2f' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Select</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Image</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reported By</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lostItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLost === item.id}
                          onChange={() => setSelectedLost(item.id === selectedLost ? null : item.id)}
                        />
                      </TableCell>
                      <TableCell><img src={item.image} alt={item.name} width="50" height="50" style={{ borderRadius: '8px' }} /></TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.reportedBy}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{getStatusIcon(item.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as 'Matched' | 'Pending Confirmation' | 'No Match';
                            setItems(prevItems => prevItems.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
                          }}
                        >
                          <MenuItem value="Matched">✅ Matched</MenuItem>
                          <MenuItem value="Pending Confirmation">⏳ Pending</MenuItem>
                          <MenuItem value="No Match">❌ No Match</MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#388e3c', textAlign: 'center' }}>Found Items</Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto', borderRadius: 2, boxShadow: 3 }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#388e3c' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Select</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Image</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reported By</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {foundItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedFound === item.id}
                          onChange={() => setSelectedFound(item.id === selectedFound ? null : item.id)}
                        />
                      </TableCell>
                      <TableCell><img src={item.image} alt={item.name} width="50" height="50" style={{ borderRadius: '8px' }} /></TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.reportedBy}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{getStatusIcon(item.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as 'Matched' | 'Pending Confirmation' | 'No Match';
                            setItems(prevItems => prevItems.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
                          }}
                        >
                          <MenuItem value="Matched">✅ Matched</MenuItem>
                          <MenuItem value="Pending Confirmation">⏳ Pending</MenuItem>
                          <MenuItem value="No Match">❌ No Match</MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          onClick={handleMatch}
          disabled={!selectedLost || !selectedFound}
          sx={{ marginTop: 3 }}
        >
          Match
        </Button>

        <Dialog open={openDialog} onClose={handleDialogClose}>
          <DialogTitle>Items Matched</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The selected lost and found items have been matched and stored in the database.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Okay
            </Button>
          </DialogActions>
        </Dialog>

        {successful === "success" && 
          <Typography color="success" align="center" sx={{ marginTop: 2 }}>
            Items matched successfully!
          </Typography>
        }
        {successful === "error" && 
          <Typography color="error" align="center" sx={{ marginTop: 2 }}>
            {errorMessage || "There was an error matching the items."}
          </Typography>
        }
      </Paper>
    </LayoutDefault>
  );
}

export default AdminMatch;