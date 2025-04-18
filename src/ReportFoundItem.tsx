import React, { useState, useEffect } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, TextField, Typography, Paper, Grid, IconButton, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

interface FormValues {
    itemName: string;
    category: string;
    dateFound: string;
    location: string;
    description: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    image: File | null;
}

// Validation schema
const validationSchema = yup.object({
    itemName: yup.string().required('Item name is required'),
    category: yup.string().required('Category is required'),
    dateFound: yup.date().required('Date found is required'),
    location: yup.string(),
    description: yup.string(),
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    phone: yup.string().required('Phone number is required'),
    image: yup.mixed()
});

const initialValues: FormValues = {
    itemName: '',
    category: '',
    dateFound: '',
    location: '',
    description: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    image: null
};

function ReportFoundItem() {
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();

    const categoryOptions = [
        'Electronics',
        'Clothing',
        'Accessories',
        'Books',
        'Documents',
        'Keys',
        'Wallet/Purse',
        'Jewelry',
        'Other'
    ];

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        severity: "error" | "warning" | "info" | "success";
        message: string;
    }>({
        open: false,
        severity: "info",
        message: "",
    });

    const handleSubmit = async (values: FormValues, { resetForm }: { resetForm: () => void }) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                formData.append(key, value as string | Blob);
            }
        });

        try {
            const response = await fetch('./Backend/ReportFoundItem.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                setSnackbar({
                    open: true,
                    message: "Found item reported successfully!",
                    severity: "success"
                });
                resetForm();
            } else {
                setSnackbar({
                    open: true,
                    message: result.message || "Error reporting found item",
                    severity: "error"
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSnackbar({
                open: true,
                message: "An error occurred while submitting the form",
                severity: "error"
            });
        }
    };

    // Check authentication status
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            setSnackbar({
                open: true,
                message: "You need to be logged in to report a found item",
                severity: "warning"
            });
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [isAuthenticated, loading, navigate]);

    if (!loading && !isAuthenticated) {
        return (
            <LayoutDefault>
                <Paper sx={{ padding: 4, maxWidth: 600, margin: 'auto', marginTop: 4 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Authentication Required
                    </Typography>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        You need to be logged in to report a found item.
                    </Alert>
                    <Box display="flex" justifyContent="center">
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => navigate('/login')}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                <Typography variant="h4" gutterBottom>Report Found Item Form</Typography>

                <Paper elevation={3} sx={{ padding: '20px', width: '80%', maxWidth: '600px' }}>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        validateOnMount={true}
                    >
                        {({ errors, touched, isSubmitting, isValid, dirty, setFieldValue }) => (
                            <Form>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            name="itemName"
                                            label="Item Name"
                                            variant="outlined"
                                            fullWidth
                                            required
                                            error={(touched.itemName || dirty) && Boolean(errors.itemName)}
                                            helperText={(touched.itemName || dirty) && errors.itemName}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl 
                                            fullWidth 
                                            required 
                                            error={(touched.category || dirty) && Boolean(errors.category)}
                                        >
                                            <InputLabel id="category-label">Category</InputLabel>
                                            <Field
                                                as={Select}
                                                name="category"
                                                labelId="category-label"
                                                label="Category"
                                            >
                                                {categoryOptions.map((option) => (
                                                    <MenuItem key={option} value={option}>
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                            </Field>
                                            {(touched.category || dirty) && errors.category && (
                                                <FormHelperText>{errors.category}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            name="dateFound"
                                            label="Date Found"
                                            type="date"
                                            variant="outlined"
                                            fullWidth
                                            required
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            error={(touched.dateFound || dirty) && Boolean(errors.dateFound)}
                                            helperText={(touched.dateFound || dirty) && errors.dateFound}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            name="location"
                                            label="Location Last Seen"
                                            variant="outlined"
                                            fullWidth
                                            error={(touched.location || dirty) && Boolean(errors.location)}
                                            helperText={(touched.location || dirty) && errors.location}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            name="description"
                                            label="Description"
                                            multiline
                                            rows={4}
                                            variant="outlined"
                                            fullWidth
                                            error={(touched.description || dirty) && Boolean(errors.description)}
                                            helperText={(touched.description || dirty) && errors.description}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">Upload Image:</Typography>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="raised-button-file"
                                            type="file"
                                            onChange={(event) => {
                                                if (event.currentTarget.files) {
                                                    setFieldValue("image", event.currentTarget.files[0]);
                                                }
                                            }}
                                        />
                                        <label htmlFor="raised-button-file">
                                            <IconButton color="primary" aria-label="upload picture" component="span">
                                                <PhotoCamera />
                                            </IconButton>
                                        </label>
                                        {(touched.image || dirty) && errors.image && (
                                            <FormHelperText error>{errors.image}</FormHelperText>
                                        )}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="h6">Contact Information:</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Field
                                            as={TextField}
                                            name="firstName"
                                            label="First Name"
                                            variant="outlined"
                                            fullWidth
                                            required
                                            error={(touched.firstName || dirty) && Boolean(errors.firstName)}
                                            helperText={(touched.firstName || dirty) && errors.firstName}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Field
                                            as={TextField}
                                            name="lastName"
                                            label="Last Name"
                                            variant="outlined"
                                            fullWidth
                                            required
                                            error={(touched.lastName || dirty) && Boolean(errors.lastName)}
                                            helperText={(touched.lastName || dirty) && errors.lastName}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            name="email"
                                            label="Email Address"
                                            variant="outlined"
                                            fullWidth
                                            required
                                            error={(touched.email || dirty) && Boolean(errors.email)}
                                            helperText={(touched.email || dirty) && errors.email}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            name="phone"
                                            label="Phone Number"
                                            variant="outlined"
                                            fullWidth
                                            required
                                            error={(touched.phone || dirty) && Boolean(errors.phone)}
                                            helperText={(touched.phone || dirty) && errors.phone}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            type="submit"
                                            disabled={!isValid || isSubmitting}
                                            fullWidth
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Form>
                        )}
                    </Formik>
                </Paper>
            </Box>
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </LayoutDefault>
    );
}

export default ReportFoundItem;