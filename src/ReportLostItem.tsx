import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';
import { Formik, Form, Field, ErrorMessage, FormikHelpers, FormikTouched, FormikErrors } from 'formik';
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
  FormHelperText,
} from '@mui/material';
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
          // Set field-level errors if they exist
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
              <Grid container spacing={3}>
                {/* Left Side Inputs */}
                <Grid item xs={12} md={6}>
                  <Field
                    name="itemName"
                    as={TextField}
                    label="Item Name"
                    fullWidth
                    required
                    error={touched.itemName && !!errors.itemName}
                    helperText={touched.itemName && errors.itemName}
                    sx={{ mb: 2 }}
                  />

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
                  />

                  <Field
                    name="location"
                    as={TextField}
                    label="Location Last Seen (Optional)"
                    fullWidth
                    error={touched.location && !!errors.location}
                    helperText={touched.location && errors.location}
                    sx={{ mb: 2 }}
                  />

                  <Field
                    name="description"
                    as={TextField}
                    label="Description (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                    error={touched.description && !!errors.description}
                    helperText={touched.description && errors.description}
                    sx={{ mb: 2 }}
                  />

                  {/* File Upload with Preview */}
                  <Box sx={{ mb: 2 }}>
                    <label htmlFor="file-upload">
                      <FileInput
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setFieldValue)}
                      />
                      <Button variant="outlined" component="span" fullWidth>
                        Upload Image (Optional)
                      </Button>
                    </label>
                    <FormHelperText error={!!errors.file}>
                      <ErrorMessage name="file" />
                    </FormHelperText>
                    {preview && (
                      <Avatar
                        src={preview}
                        alt="Preview"
                        variant="rounded"
                        sx={{ width: 150, height: 150, mt: 2 }}
                      />
                    )}
                  </Box>
                </Grid>

                {/* Right Side Inputs */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Contact Information:
                  </Typography>

                  <Field
                    name="firstName"
                    as={TextField}
                    label="First Name"
                    fullWidth
                    required
                    error={touched.firstName && !!errors.firstName}
                    helperText={touched.firstName && errors.firstName}
                    sx={{ mb: 2 }}
                  />

                  <Field
                    name="lastName"
                    as={TextField}
                    label="Last Name"
                    fullWidth
                    required
                    error={touched.lastName && !!errors.lastName}
                    helperText={touched.lastName && errors.lastName}
                    sx={{ mb: 2 }}
                  />

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
                  />

                  <Field
                    name="phone"
                    as={TextField}
                    label="Phone Number"
                    fullWidth
                    required
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                    sx={{ mb: 2 }}
                  />

                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth
                    disabled={loading || !isAuthenticated || isSubmitting || !isValid || !dirty}
                    sx={{ mt: 2 }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
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