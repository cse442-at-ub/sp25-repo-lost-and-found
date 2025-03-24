import React, { useState } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, TextField, Typography, Paper, Grid, IconButton, Snackbar, Alert, Input, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function ReportFoundItem() {
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

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!itemName || !category || !dateFound) {
            setSnackbar({
                open: true,
                message: 'Item name, category, and date found are required.',
                severity: 'error',
            });
            return;
        }

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
            //const response = await fetch('./Backend/ReportFoundItem.php', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setSnackbar({ open: true, message: "Found item reported successfully!", severity: "success" });
                // Reset form fields here if needed
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
                setSnackbar({ open: true, message: data.message || "Failed to report found item.", severity: "error" });
            }
        } catch (error) {
            console.error('Error reporting found item:', error);
            setSnackbar({ open: true, message: "An error occurred while reporting the found item.", severity: "error" });
        }
    };

    const categoryOptions = [
        'Electronics',
        'Documents',
        'Clothing',
        'Jewelry',
        'Keys',
        'Wallet',
        'Other',
    ];

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