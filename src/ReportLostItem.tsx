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
  Card,
  CardContent,
  Avatar,
  Alert,
  Snackbar,
  Box,
  FormHelperText,
  Container,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import { Email, Phone, Schedule } from '@mui/icons-material';
import LayoutDefault from './LayoutDefault';
import { GlobalStyles } from '@mui/material';

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
  itemName: Yup
    .string()
    .required('Item name is required')
    .min(2, 'Item name must be at least 2 characters')
    .max(100, 'Item name must be less than 100 characters')
    .matches(/^[a-zA-Z0-9\s\-]+$/, 'Item name can only contain letters, numbers, spaces, and hyphens'),
  dateLost: Yup
    .string()
    .nullable()
    .test('is-past-date', 'Date cannot be in the future', function(value) {
      if (!value) return true;
      const selectedDate = new Date(value);
      const today = new Date();
      return selectedDate <= today;
    }),
  location: Yup
    .string()
    .nullable()
    .max(200, 'Location must be less than 200 characters')
    .matches(/^[a-zA-Z0-9\s\-,.]+$/, 'Location can only contain letters, numbers, spaces, hyphens, commas, and periods'),
  description: Yup
    .string()
    .nullable()
    .max(1000, 'Description must be less than 1000 characters'),
  firstName: Yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .matches(/^[a-zA-Z]+$/, 'First name can only contain letters'),
  lastName: Yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .matches(/^[a-zA-Z]+$/, 'Last name can only contain letters'),
  email: Yup
    .string()
    .email('Invalid email format')
    .required('Email is required')
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),
  phone: Yup
    .string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  file: Yup
    .mixed<File>()
    .nullable()
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value) return true;
      return (value as File).size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return true;
      return ['image/jpeg', 'image/png', 'image/gif'].includes((value as File).type);
    })
});

const initialValues: FormValues = {
  itemName: '',
  dateLost: '',
  location: '',
  description: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

const globalStyles = (
  <GlobalStyles
    styles={{
      "@keyframes fadeIn": {
        from: { opacity: 0, transform: "translateY(20px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      "@keyframes pulse": {
        "0%, 100%": { transform: "scale(1)" },
        "50%": { transform: "scale(1.05)" },
      },
      "@keyframes bounce": {
        "0%, 100%": { transform: "translateY(0)" },
        "50%": { transform: "translateY(-5px)" },
      },
      ".fade-in": { animation: "fadeIn 0.6s ease-out" },
      ".fade-in-delay-1": { animation: "fadeIn 0.8s ease-out" },
      ".fade-in-delay-2": { animation: "fadeIn 1s ease-out" },
      ".pulse": { animation: "pulse 1.5s infinite" },
      ".error-bounce": { animation: "bounce 0.3s" },
    }}
  />
);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      setFieldValue('file', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const onSubmit = async (values: FormValues, { setSubmitting, setFieldError }: FormikHelpers<FormValues>) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const formData = new FormData();
    setFormErrors([]);
    
    try {
      formData.append("name", values.itemName);
      formData.append("date", values.dateLost);
      formData.append("last_seen_location", values.location);
      formData.append("description", values.description);
      formData.append("first_name", values.firstName);
      formData.append("last_name", values.lastName);
      formData.append("email_address", values.email);
      formData.append("phone_number", values.phone);

      if (values.file) {
        formData.append("file", values.file);
      }

      const response = await fetch("./Backend/reportlostitem.php", {
        method: "POST",
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccessful("success");
        setSnackbarMessage("Your lost item has been reported successfully!");
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setSuccessful("error");
        if (result.errors) {
          setFormErrors(result.errors);
          Object.entries(result.errors).forEach(([field, message]) => {
            setFieldError(field, message as string);
          });
          setSnackbarMessage("Please correct the errors in the form");
        } else if (result.error === "User not logged in") {
          setSnackbarMessage("You need to be logged in to report a lost item");
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setSnackbarMessage(result.error || "There was an error reporting your item");
        }
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSuccessful("error");
      setSnackbarMessage("There was an error submitting the form. Please try again later.");
      setOpenSnackbar(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !isAuthenticated) {
    return (
      <LayoutDefault>
        {globalStyles}
        <Container maxWidth="xl" sx={{ 
          py: 4,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>
          <Card
            sx={{
              maxWidth: 600,
              mx: 'auto',
              p: 4,
              textAlign: 'center',
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              borderRadius: 3,
            }}
            className="fade-in"
          >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>
              Authentication Required
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              You need to be logged in to report a lost item.
            </Alert>
            <Button 
              variant="contained" 
              onClick={handleLoginRedirect}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                background: "linear-gradient(135deg, #1976d2 0%, #115293 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #115293 0%, #0d3c6e 100%)",
                },
                fontSize: "1.1rem",
                fontWeight: "medium",
              }}
            >
              Go to Login
            </Button>
          </Card>
        </Container>
      </LayoutDefault>
    );
  }

  return (
    <LayoutDefault>
      {globalStyles}
      <Container maxWidth="xl" sx={{ 
        py: 4,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <Box sx={{ 
          backgroundColor: "rgba(255, 255, 255, 0.95)", 
          py: 4,
          textAlign: "center", 
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
        }}>
          <Typography
            variant="h2"
            sx={{ fontWeight: "bold", mb: 1, color: "primary.main" }}
            className="fade-in"
          >
            Report a Lost Item
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "medium", color: "primary.main", opacity: 0.9 }}
            className="fade-in-delay-1"
          >
            Help us reunite you with your belongings
          </Typography>
        </Box>

        <Box sx={{ 
          maxWidth: 1200,
          mx: "auto",
          width: "100%",
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  borderRadius: 3,
                  height: "100%",
                }}
                className="fade-in-delay-2"
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}
                  >
                    Need Help?
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
                    If you're having trouble filling out this form or need immediate assistance, 
                    please contact our support team.
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Tooltip title="Email us">
                      <Email sx={{ 
                        fontSize: 36, 
                        color: "primary.main",
                        mr: 2 
                      }} />
                    </Tooltip>
                    <Typography variant="body1" color="primary.main">
                      lostandfound@email.com
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Tooltip title="Call us">
                      <Phone sx={{ 
                        fontSize: 36, 
                        color: "primary.main",
                        mr: 2 
                      }} />
                    </Tooltip>
                    <Typography variant="body1" color="primary.main">
                      1 (716) 234-5678
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Our hours">
                      <Schedule sx={{ 
                        fontSize: 36, 
                        color: "primary.main",
                        mr: 2 
                      }} />
                    </Tooltip>
                    <Typography variant="body1" color="primary.main">
                      Weekdays 9 AM - 4 PM
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={7}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  borderRadius: 3,
                }}
                className="fade-in-delay-1"
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  {formErrors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 3 }}>
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
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Field
                              name="itemName"
                              as={TextField}
                              label="Item Name"
                              fullWidth
                              required
                              error={touched.itemName && !!errors.itemName}
                              helperText={touched.itemName && errors.itemName}
                              InputProps={{
                                sx: { borderRadius: 2 },
                              }}
                              className={errors.itemName ? "error-bounce" : ""}
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
                              InputProps={{
                                sx: { borderRadius: 2 },
                              }}
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
                              InputProps={{
                                sx: { borderRadius: 2 },
                              }}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Field
                              name="description"
                              as={TextField}
                              label="Description (Optional)"
                              fullWidth
                              multiline
                              rows={3}
                              error={touched.description && !!errors.description}
                              helperText={touched.description && errors.description}
                              InputProps={{
                                sx: { borderRadius: 2 },
                              }}
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
                                  sx={{ borderRadius: 2 }}
                                >
                                  Upload Image (Optional)
                                </Button>
                              </label>
                              <FormHelperText error={!!errors.file}>
                                <ErrorMessage name="file" />
                              </FormHelperText>
                              {preview && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                  <Avatar
                                    src={preview}
                                    alt="Preview"
                                    variant="rounded"
                                    sx={{ width: 150, height: 150 }}
                                  />
                                </Box>
                              )}
                            </Box>
                          </Grid>

                          {/* Separated Contact Information Section */}
                          <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Contact Information
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Field
                              name="firstName"
                              as={TextField}
                              label="First Name"
                              fullWidth
                              required
                              error={touched.firstName && !!errors.firstName}
                              helperText={touched.firstName && errors.firstName}
                              InputProps={{
                                sx: { borderRadius: 2 },
                              }}
                              className={errors.firstName ? "error-bounce" : ""}
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
                              InputProps={{
                                sx: { borderRadius: 2 },
                              }}
                              className={errors.lastName ? "error-bounce" : ""}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Field
                              name="email"
                              as={TextField}
                              label="Email Address"
                              type="email"
                              fullWidth
                              required
                              error={touched.email && !!errors.email}
                              helperText={touched.email && errors.email}
                              InputProps={{
                                sx: { borderRadius: 2 },
                              }}
                              className={errors.email ? "error-bounce" : ""}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Field
                              name="phone"
                              as={TextField}
                              label="Phone Number"
                              fullWidth
                              required
                              error={touched.phone && !!errors.phone}
                              helperText={touched.phone && errors.phone}
                              InputProps={{
                                sx: { borderRadius: 2 },
                              }}
                              className={errors.phone ? "error-bounce" : ""}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Button
                              type="submit"
                              variant="contained"
                              fullWidth
                              disabled={loading || !isAuthenticated || isSubmitting || !isValid || !dirty}
                              sx={{
                                py: 1.8,
                                borderRadius: 2,
                                background: "linear-gradient(135deg, #1976d2 0%, #115293 100%)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #115293 0%, #0d3c6e 100%)",
                                  transform: "scale(1.03)",
                                },
                                "&:disabled": { background: "#b0bec5" },
                                transition: "transform 0.2s, background 0.2s",
                                textTransform: "none",
                                fontSize: "1.2rem",
                                fontWeight: "medium",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                              }}
                              className={isValid && dirty && !isSubmitting ? "pulse" : ""}
                            >
                              {isSubmitting ? <CircularProgress size={28} color="inherit" /> : 'Submit Report'}
                            </Button>
                          </Grid>
                        </Grid>
                      </Form>
                    )}
                  </Formik>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
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
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LayoutDefault>
  );
}

export default ReportLostItem;