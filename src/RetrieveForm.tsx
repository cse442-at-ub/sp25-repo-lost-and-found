import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Container,
  Paper,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  InputLabel
} from '@mui/material';
import LayoutDefault from './LayoutDefault';

import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';

const RetrieveForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    deliveryMethod: 'pickup',
    preferredTime: '',
    additionalInstructions: '',
    address: '',
    county: '',
    state: '',
    zipcode: '',
    pickupLocation: ''
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success";
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value as string }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // You can send formData to backend here
    console.log('Submitted:', formData);

    const deliveryMessage = formData.deliveryMethod === 'shipping'
      ? 'Form submitted! Your item will be shipped within 3-5 business days.'
      : 'Form submitted! Please pick up your item from the selected location with a valid ID.';

    setSnackbar({
      open: true,
      message: deliveryMessage,
      severity: 'success'
    });

    setTimeout(() => navigate('/notifications'), 3000);

    if (formData.deliveryMethod === 'pickup') {
      const dateTime = new Date(formData.preferredTime);
    
      if (
        isNaN(dateTime.getTime()) ||
        dateTime.getHours() < 9 ||
        dateTime.getHours() >= 17 ||
        dateTime.getDay() === 0 || // Sunday
        dateTime.getDay() === 6    // Saturday
      ) {
        setSnackbar({
          open: true,
          message: 'Please choose a time between 9 AM and 5 PM, Monday to Friday for pickup.',
          severity: 'error'
        });
        return;
      }
    }
  };

  return (
    <LayoutDefault>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom>
            Retrieve Your Item
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Your Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Your Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Delivery Method</FormLabel>
              <RadioGroup
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleChange}
                row
              >
                <FormControlLabel value="pickup" control={<Radio />} label="In-Person Pickup" />
                <FormControlLabel value="shipping" control={<Radio />} label="Shipping to Address" />
              </RadioGroup>
            </FormControl>

            {formData.deliveryMethod === 'pickup' && (
              <>
                <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="body1">
                    ⚠️ Please bring a valid ID (UB Card, Driver’s License, etc.) when you come to pick up your item.
                  </Typography>
                </Box>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Pickup Location</InputLabel>
                  <Select
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleSelectChange}
                    required
                  >
                    <MenuItem value="Silverman Library">Silverman Library - 3rd floor circulation desk</MenuItem>
                    <MenuItem value="Student Union">Student Union - Welcome center</MenuItem>
                    <MenuItem value="Capen Hall">1 Capen Hall</MenuItem>
                    <MenuItem value="Lockwood Library">Lockwood Library - 2nd floor circulation desk</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Preferred Time for Retrieval"
                  name="preferredTime"
                  type="datetime-local"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g., Tomorrow at 3 PM"
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {formData.deliveryMethod === 'shipping' && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Shipping Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="County"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Zip Code"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            )}

            

            <TextField
              label="Additional Instructions"
              name="additionalInstructions"
              value={formData.additionalInstructions}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />

            <Button type="submit" variant="contained" size="large">
              Submit
            </Button>
          </form>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LayoutDefault>
  );
};

export default RetrieveForm;
