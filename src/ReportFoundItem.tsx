import React, { useState, useEffect } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, TextField, Typography, Paper, Grid, IconButton, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
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
        }
    });

    const onSubmit = async (data: FormValues) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
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
                reset();
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

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            // You can handle the image file here if needed
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
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Item Name"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    {...register('itemName')}
                                    error={!!errors.itemName}
                                    helperText={errors.itemName?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required error={!!errors.category}>
                                    <InputLabel id="category-label">Category</InputLabel>
                                    <Controller
                                        name="category"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                labelId="category-label"
                                                id="category"
                                                label="Category"
                                                {...field}
                                            >
                                                {categoryOptions.map((option) => (
                                                    <MenuItem key={option} value={option}>
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    {errors.category && (
                                        <FormHelperText>{errors.category.message}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Date Found"
                                    type="date"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    {...register('dateFound')}
                                    error={!!errors.dateFound}
                                    helperText={errors.dateFound?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Location Last Seen"
                                    variant="outlined"
                                    fullWidth
                                    {...register('location')}
                                    error={!!errors.location}
                                    helperText={errors.location?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Description"
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    fullWidth
                                    {...register('description')}
                                    error={!!errors.description}
                                    helperText={errors.description?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1">Upload Image:</Typography>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="raised-button-file"
                                    type="file"
                                    onChange={handleImageChange}
                                />
                                <label htmlFor="raised-button-file">
                                    <IconButton color="primary" aria-label="upload picture" component="span">
                                        <PhotoCamera />
                                    </IconButton>
                                </label>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6">Contact Information:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="First Name"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    {...register('firstName')}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName?.message}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Last Name"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    {...register('lastName')}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Email Address"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Phone Number"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    {...register('phone')}
                                    error={!!errors.phone}
                                    helperText={errors.phone?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </LayoutDefault>
    );
}

export default ReportFoundItem;