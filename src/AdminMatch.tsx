import React, { useState } from 'react';
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
} from '@mui/material';
import { Search, CheckCircle, Pending, Cancel } from '@mui/icons-material';
import LayoutDefault from './LayoutDefault';

interface Item {
  id: number;
  name: string;
  type: 'Lost' | 'Found';
  reportedBy: string;
  status: 'Matched' | 'Pending Confirmation' | 'No Match';
  date: string;
  image: string;
  description: string;
  location: string;
}

const sampleItems: Item[] = [
  { id: 1, name: 'Black Wallet', type: 'Lost', reportedBy: 'Alice', status: 'Pending Confirmation', date: '2025-03-10', image: '/wallet.jpg', description: 'Black leather wallet with credit cards.', location: 'Main Street Park' },
  { id: 2, name: 'iPhone 12', type: 'Found', reportedBy: 'Bob', status: 'Matched', date: '2025-03-09', image: '/iphone.jpg', description: 'White iPhone 12 with a clear case.', location: 'City Library' },
  { id: 3, name: 'Car Keys', type: 'Lost', reportedBy: 'Charlie', status: 'Pending Confirmation', date: '2025-03-11', image: '/keys.jpg', description: 'Set of car keys with a blue keychain.', location: 'Shopping Mall' },
  { id: 4, name: 'Laptop Bag', type: 'Found', reportedBy: 'David', status: 'Matched', date: '2025-03-08', image: '/laptopbag.jpg', description: 'Black laptop bag with a Dell laptop.', location: 'Train Station' },
  { id: 5, name: 'Blue Backpack', type: 'Lost', reportedBy: 'Emma', status: 'Pending Confirmation', date: '2025-03-07', image: '/backpack.jpg', description: 'Blue backpack with books and a water bottle.', location: 'School Campus' },
  { id: 6, name: 'Smartwatch', type: 'Found', reportedBy: 'Frank', status: 'No Match', date: '2025-03-06', image: '/smartwatch.jpg', description: 'Silver smartwatch with a black band.', location: 'Fitness Center' },
];

function AdminMatch() {
  const [items, setItems] = useState<Item[]>(sampleItems);
  const [search, setSearch] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.toLowerCase());
  };

  const handleStatusChange = (id: number, newStatus: 'Matched' | 'Pending Confirmation' | 'No Match') => {
    setItems(items.map(item => (item.id === id ? { ...item, status: newStatus } : item)));
  };

  const filteredItems = items.filter(
    item => item.name.toLowerCase().includes(search) || item.reportedBy.toLowerCase().includes(search)
  );

  const lostItems = filteredItems.filter(item => item.type === 'Lost');
  const foundItems = filteredItems.filter(item => item.type === 'Found');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Matched':
        return <CheckCircle style={{ color: 'green' }} />;
      case 'Pending Confirmation':
        return <Pending style={{ color: 'goldenrod' }} />;
      case 'No Match':
        return <Cancel style={{ color: 'red' }} />;
      default:
        return null;
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
            <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto', borderRadius: 2, boxShadow: 3, width: 'auto' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#d32f2f' }}>
                  <TableRow>
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
                      <TableCell><img src={item.image} alt={item.name} width="50" height="50" style={{ borderRadius: '8px' }} /></TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.reportedBy}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        {getStatusIcon(item.status)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as 'Matched' | 'Pending Confirmation' | 'No Match')}
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
                      <TableCell><img src={item.image} alt={item.name} width="50" height="50" style={{ borderRadius: '8px' }} /></TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.reportedBy}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        {getStatusIcon(item.status)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as 'Matched' | 'Pending Confirmation' | 'No Match')}
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
      </Paper>
    </LayoutDefault>
  );
}

export default AdminMatch;