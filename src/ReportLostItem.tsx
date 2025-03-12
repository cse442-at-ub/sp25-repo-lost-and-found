import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  Paper,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/system';
import LayoutDefault from './LayoutDefault';

const FileInput = styled('input')({
  display: 'none',
});

function ReportLostItem() {
  const { control, handleSubmit, register, formState: { errors } } = useForm();
  const [preview, setPreview] = useState(null);

  const onSubmit = (data) => {
    console.log('Form Data:', data);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <LayoutDefault>
      <Paper sx={{ padding: 4, maxWidth: 900, margin: 'auto', marginTop: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Report Lost Item Form
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Left Side Inputs */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Item Name"
                fullWidth
                required
                {...register('itemName', { required: 'Item name is required' })}
                error={!!errors.itemName}
                helperText={errors.itemName?.message}
                sx={{ mb: 2 }}
              />

              <Controller
                name="category"
                control={control}
                defaultValue=""
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <TextField
                    select
                    label="Category"
                    fullWidth
                    {...field}
                    error={!!errors.category}
                    helperText={errors.category?.message}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="Bag/Luggage">Bag/Luggage</MenuItem>
                    <MenuItem value="Electronics">Electronics</MenuItem>
                    <MenuItem value="Clothing">Clothing</MenuItem>
                  </TextField>
                )}
              />

              <TextField
                label="Date Lost"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('dateLost', { required: 'Date is required' })}
                error={!!errors.dateLost}
                helperText={errors.dateLost?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Location Last Seen"
                fullWidth
                {...register('location')}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                {...register('description')}
                sx={{ mb: 2 }}
              />

              {/* File Upload with Preview */}
              <label htmlFor="file-upload">
                <FileInput
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  {...register('file')}
                  onChange={handleFileChange}
                />
                <Button variant="outlined" component="span" fullWidth>
                  Upload Image
                </Button>
              </label>

              {/* Show Preview If Available */}
              {preview && (
                <Avatar
                  src={preview}
                  alt="Preview"
                  variant="rounded"
                  sx={{ width: 150, height: 150, mt: 2 }}
                />
              )}
            </Grid>

            {/* Right Side Inputs */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Contact Information:
              </Typography>

              <TextField
                label="First Name"
                fullWidth
                required
                {...register('firstName', { required: 'First name is required' })}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Last Name"
                fullWidth
                required
                {...register('lastName', { required: 'Last name is required' })}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Phone Number"
                fullWidth
                required
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: { value: /^\d{10}$/, message: 'Invalid phone number' },
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                sx={{ mb: 2 }}
              />

              {/* Submit Button */}
              <Button type="submit" variant="contained" fullWidth>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </LayoutDefault>
  );
}

export default ReportLostItem;
