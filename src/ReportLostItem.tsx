import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Avatar,
  Alert,
  Snackbar,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Card,
  CardContent,
  Container
} from '@mui/material';
import { Email, Phone, Schedule, HelpOutline } from '@mui/icons-material';
import { styled } from '@mui/system';
import LayoutDefault from './LayoutDefault';

const FileInput = styled('input')({
  display: 'none',
});

interface FormValues {
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

const validationSchema = Yup.object().shape({
  // ... keep your existing validation schema ...
});

const initialValues: FormValues = {
  // ... keep your existing initial values ...
};

function ReportLostItem() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [preview, setPreview] = useState<string>("");
  const [successful, setSuccessful] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setSnackbarMessage("You need to be logged in to report a lost item");
      setOpenSnackbar(true);
    }
  }, [isAuthenticated, loading]);

  // ... keep your existing handler functions ...

  if (!loading && !isAuthenticated) {
    return (
      <LayoutDefault>
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Card sx={{ 
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            borderRadius: 3,
            p: 4
          }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Authentication Required
            </Typography>
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              You need to be logged in to report a lost item.
            </Alert>
            <Box display="flex" justifyContent="center">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleLoginRedirect}
                size="large"
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #115293 0%, #0d3c6e 100%)',
                    transform: 'scale(1.03)'
                  },
                  transition: 'transform 0.2s, background 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  py: 1.5,
                  px: 4
                }}
              >
                Go to Login
              </Button>
            </Box>
          </Card>
        </Container>
      </LayoutDefault>
    );
  }

  return (
    <LayoutDefault>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Card sx={{ 
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          borderRadius: 3,
          p: { xs: 2, sm: 4 }
        }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main',
            mb: 4,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '4px',
              backgroundColor: 'primary.main',
              borderRadius: 2
            }
          }}>
            Report Lost Item
          </Typography>

          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Please fix the following errors:
              </Typography>
              <ul>
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Formik<FormValues>
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                validateOnBlur={true}
                validateOnChange={true}
              >
                {({ 
                  isSubmitting, 
                  setFieldValue, 
                  errors, 
                  touched,
                  isValid,
                  dirty
                }) => (
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          name="itemName"
                          as={TextField}
                          label="Item Name"
                          fullWidth
                          required
                          error={touched.itemName && !!errors.itemName}
                          helperText={touched.itemName && errors.itemName}
                          sx={{ mb: 2 }}
                          InputProps={{
                            sx: { borderRadius: 2 },
                            endAdornment: (
                              <Tooltip title="Enter the name of your lost item">
                                <HelpOutline color="action" sx={{ ml: 1 }} />
                              </Tooltip>
                            )
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Field
                          name="dateLost"
                          as={TextField}
                          label="Date Lost (Optional)"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={touched.dateLost && !!errors.dateLost}
                          helperText={touched.dateLost && errors.dateLost}
                          sx={{ mb: 2 }}
                          InputProps={{ sx: { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Field
                          name="location"
                          as={TextField}
                          label="Location Last Seen (Optional)"
                          fullWidth
                          error={touched.location && !!errors.location}
                          helperText={touched.location && errors.location}
                          sx={{ mb: 2 }}
                          InputProps={{ sx: { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Field
                          name="description"
                          as={TextField}
                          label="Description (Optional)"
                          fullWidth
                          multiline
                          rows={4}
                          error={touched.description && !!errors.description}
                          helperText={touched.description && errors.description}
                          sx={{ mb: 2 }}
                          InputProps={{ sx: { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ mb: 2 }}>
                          <label htmlFor="file-upload">
                            <FileInput
                              id="file-upload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, setFieldValue)}
                            />
                            <Button 
                              variant="outlined" 
                              component="span" 
                              fullWidth
                              sx={{ borderRadius: 2, py: 1.5 }}
                            >
                              Upload Image (Optional)
                            </Button>
                          </label>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            <ErrorMessage name="file" />
                          </Typography>
                          {preview && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                              <Avatar
                                src={preview}
                                alt="Preview"
                                variant="rounded"
                                sx={{ 
                                  width: 200, 
                                  height: 200, 
                                  boxShadow: 3,
                                  borderRadius: 2
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: 3,
                p: 3,
                height: '100%'
              }}>
                <Typography variant="h5" sx={{ 
                  mb: 3, 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}>
                  Contact Information
                </Typography>

                <Formik<FormValues>
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={onSubmit}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Field
                            name="firstName"
                            as={TextField}
                            label="First Name"
                            fullWidth
                            required
                            error={touched.firstName && !!errors.firstName}
                            helperText={touched.firstName && errors.firstName}
                            sx={{ mb: 2 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Field
                            name="lastName"
                            as={TextField}
                            label="Last Name"
                            fullWidth
                            required
                            error={touched.lastName && !!errors.lastName}
                            helperText={touched.lastName && errors.lastName}
                            sx={{ mb: 2 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field
                            name="email"
                            as={TextField}
                            label="Email Address"
                            type="email"
                            fullWidth
                            required
                            error={touched.email && !!errors.email}
                            helperText={touched.email && errors.email}
                            sx={{ mb: 2 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field
                            name="phone"
                            as={TextField}
                            label="Phone Number"
                            fullWidth
                            required
                            error={touched.phone && !!errors.phone}
                            helperText={touched.phone && errors.phone}
                            sx={{ mb: 2 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth
                            disabled={loading || !isAuthenticated}
                            sx={{ 
                              mt: 2,
                              py: 1.8,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #115293 0%, #0d3c6e 100%)',
                                transform: 'scale(1.03)'
                              },
                              '&:disabled': { background: '#b0bec5' },
                              transition: 'transform 0.2s, background 0.2s',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                          >
                            {isSubmitting ? (
                              <CircularProgress size={24} color="inherit" />
                            ) : 'Submit Report'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Need Help?
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Phone color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="1 (716) 234-5678" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Email color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="lostandfound@email.com" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Schedule color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Weekdays 9 AM - 4 PM" />
                    </ListItem>
                  </List>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Card>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={successful === "success" ? "success" : "error"}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LayoutDefault>
  );
}

export default ReportLostItem;