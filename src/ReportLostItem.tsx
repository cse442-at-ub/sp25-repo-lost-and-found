import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  Paper,
  Avatar,
  Alert,
  Snackbar,
  Box,
} from '@mui/material';
import { styled } from '@mui/system';
import LayoutDefault from './LayoutDefault';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';

const FileInput = styled('input')({
  display: 'none',
});

interface FormData {
  itemName: string;
  dateLost: string;
  location: string;
  description: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  file?: File;
}

const schema = yup.object().shape({
  itemName: yup.string().required('Item name is required'),
  dateLost: yup.string().required('Date lost is required'),
  location: yup.string().required('Location is required'),
  description: yup.string().required('Description is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
});

function ReportLostItem() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { control, handleSubmit, register, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [successful, setSuccessful] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Check authentication status
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // User is not authenticated, show snackbar message
      setSnackbarMessage("You need to be logged in to report a lost item");
      setOpenSnackbar(true);
    }
  }, [isAuthenticated, loading]);

  const onSubmit = async (data: FormData) => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const formData = new FormData();
    
    formData.append("name", data.itemName);
    formData.append("date", data.dateLost);
    formData.append("last_seen_location", data.location);
    formData.append("description", data.description);
    formData.append("first_name", data.firstName);
    formData.append("last_name", data.lastName);
    formData.append("email_address", data.email);
    formData.append("phone_number", data.phone);

    if (fileUpload) {
        formData.append("file", fileUpload);
    }

    try {
        const response = await fetch("./Backend/reportlostitem.php", {
            method: "POST",
            body: formData,
            credentials: 'include', // Include cookies for session authentication
        });

        const result = await response.json();
        console.log("Response:", result);
        
        if(result['success']) {
          setSuccessful("success");
          setSnackbarMessage("Your lost item has been reported successfully!");
          setOpenSnackbar(true);
        } else if (result['error'] === "User not logged in") {
          setSuccessful("error");
          setSnackbarMessage("You need to be logged in to report a lost item");
          setOpenSnackbar(true);
          // Redirect to login page after a brief delay
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setSuccessful("error");
          setSnackbarMessage("There was an error reporting your item");
          setOpenSnackbar(true);
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        setSuccessful("error");
        setSnackbarMessage("There was an error submitting the form");
        setOpenSnackbar(true);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileUpload(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  // If not authenticated, display login message
  if (!loading && !isAuthenticated) {
    return (
      <LayoutDefault>
        <Paper sx={{ padding: 4, maxWidth: 600, margin: 'auto', marginTop: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Authentication Required
          </Typography>
          <Alert severity="warning" sx={{ mb: 3 }}>
            You need to be logged in to report a lost item.
          </Alert>
          <Box display="flex" justifyContent="center">
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleLoginRedirect}
              size="large"
            >
              Go to Login
            </Button>
          </Box>
        </Paper>
      </LayoutDefault>
    );
  }

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
                {...register('itemName')}
                error={!!errors.itemName}
                helperText={errors.itemName?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Date Lost"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('dateLost')}
                error={!!errors.dateLost}
                helperText={errors.dateLost?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Location Last Seen"
                fullWidth
                {...register('location')}
                error={!!errors.location}
                helperText={errors.location?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
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
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Last Name"
                fullWidth
                required
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Phone Number"
                fullWidth
                required
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                sx={{ mb: 2 }}
              />

              {successful == "success" && 
                <Alert severity="success" sx={{ mb: 2 }}>
                  Posted your lost item. Hopefully it's found soon!
                </Alert>
              }

              {successful == "error" && 
                <Alert severity="error" sx={{ mb: 2 }}>
                  There was an error posting your item at this time.
                </Alert>
              }

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                disabled={loading || !isAuthenticated}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={successful === "success" ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LayoutDefault>
  );
}

export default ReportLostItem;