import React, { useState, useEffect } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, TextField, Typography, Paper, Grid, IconButton, Snackbar, Alert, Input, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useNavigate } from 'react-router'; // Import useNavigate
import { useAuth } from './components/AuthContext'; // Import useAuth

function ReportFoundItem() {
    const navigate = useNavigate(); // Initialize useNavigate
    const { isAuthenticated, loading } = useAuth(); // Use the auth context

    // Define the missing categoryOptions array
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

    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('');
    const [dateFound, setDateFound] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        severity: "error" | "warning" | "info" | "success";
        message: string;
    }>({
        open: false,
        severity: "info",
        message: "",
    });

    // Add the missing handleImageChange function
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    };

    // Add the missing handleSubmit function
    const handleSubmit = async () => {
        if (!itemName || !category || !dateFound) {
            setSnackbar({
                open: true,
                message: "Please fill in all required fields",
                severity: "error"
            });
            return;
        }

        // Create form data to send to backend
        const formData = new FormData();
        formData.append('itemName', itemName);
        formData.append('category', category);
        formData.append('dateFound', dateFound);
        formData.append('location', location);
        formData.append('description', description);
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('phone', phone);
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await fetch('./Backend/ReportFoundItem.php', {
                method: 'POST',
                body: formData,
                credentials: 'include' // Include cookies for session
            });

            const result = await response.json();
            
            if (result.success) {
                setSnackbar({
                    open: true,
                    message: "Found item reported successfully!",
                    severity: "success"
                });
                // Reset form fields
                setItemName('');
                setCategory('');
                setDateFound('');
                setLocation('');
                setDescription('');
                setFirstName('');
                setLastName('');
                setEmail('');
                setPhone('');
                setImage(null);
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
            // User is not authenticated, show snackbar message
            setSnackbar({
                open: true,
                message: "You need to be logged in to report a found item",
                severity: "warning"
            });
            // Optional: redirect after a delay
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [isAuthenticated, loading, navigate]);

    // If not authenticated, display login message
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
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Item Name"
                                variant="outlined"
                                fullWidth
                                required
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            {/* Replace TextField with Select */}
                            <FormControl fullWidth required>
                                <InputLabel id="category-label">Category</InputLabel>
                                <Select
                                labelId="category-label"
                                id="category"
                                value={category}
                                label="Category"
                                onChange={(e) => setCategory(e.target.value)}
                                >
                                {categoryOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                    {option}
                                    </MenuItem>
                                ))}
                                </Select>
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
                                value={dateFound}
                                onChange={(e) => setDateFound(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Location Last Seen"
                                variant="outlined"
                                fullWidth
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                multiline
                                rows={4}
                                variant="outlined"
                                fullWidth
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">Upload Image:</Typography>
                            <Input accept="image/*" style={{ display: 'none' }} id="raised-button-file" type="file" onChange={handleImageChange} />
                            <label htmlFor="raised-button-file">
                                <IconButton color="primary" aria-label="upload picture" component="span">
                                    <PhotoCamera />
                                </IconButton>
                                {image && <Typography variant="caption">{image.name}</Typography>}
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
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Last Name"
                                variant="outlined"
                                fullWidth
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Email Address"
                                variant="outlined"
                                fullWidth
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Phone Number"
                                variant="outlined"
                                fullWidth
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </LayoutDefault>
    );
}

export default ReportFoundItem;