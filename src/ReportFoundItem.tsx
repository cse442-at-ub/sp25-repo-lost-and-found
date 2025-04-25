import React, { useState, useEffect } from 'react';
import LayoutDefault from './LayoutDefault';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Snackbar, 
  Alert, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  FormHelperText,
  Container,
  Avatar,
  Tooltip,
  CircularProgress,
  IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { Email, Phone, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/system';
import { GlobalStyles } from '@mui/material';

const FileInput = styled('input')({
  display: 'none',
});

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

const validationSchema = yup.object({
    itemName: yup.string()
        .required('Item name is required')
        .min(2, 'Item name must be at least 2 characters')
        .max(100, 'Item name must be less than 100 characters'),
    category: yup.string().required('Category is required'),
    dateFound: yup.date()
        .required('Date found is required')
        .max(new Date(), 'Date cannot be in the future'),
    location: yup.string()
        .max(200, 'Location must be less than 200 characters'),
    description: yup.string()
        .max(1000, 'Description must be less than 1000 characters'),
    firstName: yup.string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .matches(/^[a-zA-Z]+$/, 'First name can only contain letters'),
    lastName: yup.string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .matches(/^[a-zA-Z]+$/, 'Last name can only contain letters'),
    email: yup.string()
        .email('Enter a valid email')
        .required('Email is required')
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),
    phone: yup.string()
        .required('Phone number is required')
        .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
    image: yup.mixed()
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

function ReportFoundItem() {
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();
    const [preview, setPreview] = useState<string>("");
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        severity: "error" | "warning" | "info" | "success";
        message: string;
    }>({
        open: false,
        severity: "info",
        message: "",
    });

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

    const handleSubmit = async (values: FormValues, { resetForm }: { resetForm: () => void }) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

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
                setPreview("");
            } else {
                setSnackbar({
                    open: true,
                    message: result.message || "Error reporting found item",
                    severity: "error"
                });
                if (result.error === "User not logged in") {
                    setTimeout(() => navigate('/login'), 1500);
                }
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

    const handleLoginRedirect = () => {
        navigate('/login');
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
                            You need to be logged in to report a found item.
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
                        Report a Found Item
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ mb: 2, fontWeight: "medium", color: "primary.main", opacity: 0.9 }}
                        className="fade-in-delay-1"
                    >
                        Help reunite lost items with their owners
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
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                        validateOnMount={true}
                                    >
                                        {({ 
                                            errors, 
                                            touched, 
                                            isSubmitting, 
                                            isValid, 
                                            dirty, 
                                            setFieldValue 
                                        }) => (
                                            <Form>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Field
                                                            as={TextField}
                                                            name="itemName"
                                                            label="Item Name"
                                                            fullWidth
                                                            required
                                                            error={touched.itemName && Boolean(errors.itemName)}
                                                            helperText={touched.itemName && errors.itemName}
                                                            InputProps={{
                                                                sx: { borderRadius: 2 },
                                                            }}
                                                            className={errors.itemName ? "error-bounce" : ""}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <FormControl 
                                                            fullWidth 
                                                            required 
                                                            error={touched.category && Boolean(errors.category)}
                                                            sx={{ borderRadius: 2 }}
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
                                                            <ErrorMessage name="category">
                                                                {(msg) => <FormHelperText error>{msg}</FormHelperText>}
                                                            </ErrorMessage>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Field
                                                            as={TextField}
                                                            name="dateFound"
                                                            label="Date Found"
                                                            type="date"
                                                            fullWidth
                                                            required
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            error={touched.dateFound && Boolean(errors.dateFound)}
                                                            helperText={touched.dateFound && errors.dateFound}
                                                            InputProps={{
                                                                sx: { borderRadius: 2 },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Field
                                                            as={TextField}
                                                            name="location"
                                                            label="Location Found"
                                                            fullWidth
                                                            error={touched.location && Boolean(errors.location)}
                                                            helperText={touched.location && errors.location}
                                                            InputProps={{
                                                                sx: { borderRadius: 2 },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Field
                                                            as={TextField}
                                                            name="description"
                                                            label="Description (Optional)"
                                                            multiline
                                                            rows={3}
                                                            fullWidth
                                                            error={touched.description && Boolean(errors.description)}
                                                            helperText={touched.description && errors.description}
                                                            InputProps={{
                                                                sx: { borderRadius: 2 },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <label htmlFor="image-upload">
                                                                <FileInput
                                                                    id="image-upload"
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(event) => {
                                                                        if (event.currentTarget.files) {
                                                                            setFieldValue("image", event.currentTarget.files[0]);
                                                                            setPreview(URL.createObjectURL(event.currentTarget.files[0]));
                                                                        }
                                                                    }}
                                                                />
                                                                <Button 
                                                                    variant="outlined" 
                                                                    component="span" 
                                                                    fullWidth
                                                                    sx={{ borderRadius: 2 }}
                                                                    startIcon={<PhotoCamera />}
                                                                >
                                                                    Upload Image (Optional)
                                                                </Button>
                                                            </label>
                                                            <ErrorMessage name="image">
                                                                {(msg) => <FormHelperText error>{msg}</FormHelperText>}
                                                            </ErrorMessage>
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
                                                    <Grid item xs={12}>
                                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                                            Contact Information
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Field
                                                            as={TextField}
                                                            name="firstName"
                                                            label="First Name"
                                                            fullWidth
                                                            required
                                                            error={touched.firstName && Boolean(errors.firstName)}
                                                            helperText={touched.firstName && errors.firstName}
                                                            InputProps={{
                                                                sx: { borderRadius: 2 },
                                                            }}
                                                            className={errors.firstName ? "error-bounce" : ""}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Field
                                                            as={TextField}
                                                            name="lastName"
                                                            label="Last Name"
                                                            fullWidth
                                                            required
                                                            error={touched.lastName && Boolean(errors.lastName)}
                                                            helperText={touched.lastName && errors.lastName}
                                                            InputProps={{
                                                                sx: { borderRadius: 2 },
                                                            }}
                                                            className={errors.lastName ? "error-bounce" : ""}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Field
                                                            as={TextField}
                                                            name="email"
                                                            label="Email Address"
                                                            type="email"
                                                            fullWidth
                                                            required
                                                            error={touched.email && Boolean(errors.email)}
                                                            helperText={touched.email && errors.email}
                                                            InputProps={{
                                                                sx: { borderRadius: 2 },
                                                            }}
                                                            className={errors.email ? "error-bounce" : ""}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Field
                                                            as={TextField}
                                                            name="phone"
                                                            label="Phone Number"
                                                            fullWidth
                                                            required
                                                            error={touched.phone && Boolean(errors.phone)}
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
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </LayoutDefault>
    );
}

export default ReportFoundItem;