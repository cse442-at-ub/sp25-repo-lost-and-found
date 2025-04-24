import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Snackbar,
    Alert,
    Container,
    Paper,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
    Grid,
    MenuItem,
    Select,
    InputLabel,
    CircularProgress,
    Card,
    CardContent,
    CardMedia,
    Divider,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import LayoutDefault from './LayoutDefault';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';

interface FormData {
    foundItemId: number | null;
    name: string;
    email: string;
    deliveryMethod: 'pickup' | 'shipping';
    preferredTime: string;
    additionalInstructions: string;
    address: string;
    county: string;
    state: string;
    zipcode: string;
    pickupLocation: string;
}

interface FoundItem {
    id: number;
    item_name: string;
    description: string;
    location_found: string;
    date_found: string;
    category: string;
    image: string;
}

const RetrieveForm: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        foundItemId: null,
        name: '',
        email: '',
        deliveryMethod: 'pickup',
        preferredTime: '',
        additionalInstructions: '',
        address: '',
        county: '',
        state: '',
        zipcode: '',
        pickupLocation: ''
    });

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'error' | 'success' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [availableItems, setAvailableItems] = useState<FoundItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [error, setError] = useState('');

    // Check if user is authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            setSnackbar({
                open: true,
                message: 'Please log in to continue',
                severity: 'warning'
            });
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Fetch available items that can be retrieved
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchAvailableItems = async () => {
            setLoadingItems(true);
            try {
                const response = await fetch('./Backend/getAvailableItems.php', {
                    credentials: 'include' // Include cookies for session
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.success) {
                    setAvailableItems(data.items || []);
                } else {
                    setError(data.message || 'Failed to load available items');
                    setSnackbar({
                        open: true,
                        message: data.message || 'Failed to load available items',
                        severity: 'error'
                    });
                }
            } catch (err) {
                console.error('Error fetching available items:', err);
                setError('Failed to load available items. Please try again later.');
                setSnackbar({
                    open: true,
                    message: 'Failed to load available items. Please try again later.',
                    severity: 'error'
                });
            } finally {
                setLoadingItems(false);
            }
        };

        fetchAvailableItems();
    }, [isAuthenticated]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (name === 'preferredTime' && value) {
            // Convert datetime-local format to YYYY-MM-DD HH:MM:SS
            const formattedValue = value.replace('T', ' ') + ':00'; // Add seconds
            setFormData((prev) => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (
        e: React.ChangeEvent<{ name?: string; value: unknown }>
    ) => {
        const { name, value } = e.target;
        if (name) {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleItemSelect = (itemId: number) => {
        setFormData((prev) => ({ ...prev, foundItemId: itemId }));
    };

    const handleDeliveryMethodChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({ ...prev, deliveryMethod: e.target.value as 'pickup' | 'shipping' }));
    };

    const handleNext = () => {
        if (activeStep === 0 && !formData.foundItemId) {
            setSnackbar({
                open: true,
                message: 'Please select an item to continue',
                severity: 'warning'
            });
            return;
        }
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setSnackbar({ 
                open: true, 
                message: "You must be logged in to submit a request.", 
                severity: "error" 
            });
            return;
        }

        if (!formData.foundItemId) {
            setSnackbar({
                open: true,
                message: 'No item has been selected for retrieval',
                severity: 'error'
            });
            return;
        }

        // Validate required fields based on delivery method
        if (formData.deliveryMethod === 'pickup' && !formData.pickupLocation) {
            setSnackbar({
                open: true,
                message: 'Please select a pickup location',
                severity: 'warning'
            });
            return;
        } else if (formData.deliveryMethod === 'shipping' && 
                  (!formData.address || !formData.county || !formData.state || !formData.zipcode)) {
            setSnackbar({
                open: true,
                message: 'Please fill in all shipping address fields',
                severity: 'warning'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('./Backend/submitRetrieveRequest.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                credentials: 'include' // Include cookies for session
            });

            const data = await response.json();

            if (data.success) {
                setSnackbar({ 
                    open: true, 
                    message: "Your retrieval request has been submitted successfully!", 
                    severity: "success" 
                });
                // Reset form and go back to first step
                setFormData({
                    foundItemId: null,
                    name: '',
                    email: '',
                    deliveryMethod: 'pickup',
                    preferredTime: '',
                    additionalInstructions: '',
                    address: '',
                    county: '',
                    state: '',
                    zipcode: '',
                    pickupLocation: ''
                });
                setActiveStep(0);
                
                // Redirect to dashboard after a delay
                setTimeout(() => navigate('/user-dashboard'), 3000);
            } else {
                setSnackbar({ 
                    open: true, 
                    message: data.message || "Failed to submit request.", 
                    severity: "error" 
                });
            }
        } catch (error) {
            console.error("Error submitting retrieval request:", error);
            setSnackbar({ 
                open: true, 
                message: "Network error. Please try again.", 
                severity: "error" 
            });
        } finally {
            setLoading(false);
        }
    };

    // Steps for the form process
    const steps = ['Select Item', 'Retrieval Details', 'Review & Submit'];

    // Render the step content based on active step
    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Select an Item to Retrieve
                        </Typography>
                        {loadingItems ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Alert severity="error" sx={{ my: 2 }}>
                                {error}
                            </Alert>
                        ) : availableItems.length === 0 ? (
                            <Alert severity="info" sx={{ my: 2 }}>
                                No items are available for retrieval. If you reported a lost item, please wait for an admin to match it with a found item.
                            </Alert>
                        ) : (
                            <>
                                {/* Show selected item if there is one */}
                                {formData.foundItemId && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            Selected Item:
                                        </Typography>
                                        <Paper elevation={1} sx={{ p: 2 }}>
                                            {(() => {
                                                const selectedItem = availableItems.find(item => item.id === formData.foundItemId);
                                                if (!selectedItem) return null;
                                                
                                                return (
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={4}>
                                                            <Box 
                                                                component="img" 
                                                                src={selectedItem.image ? `./Backend/${selectedItem.image}` : "./no-image.png"}
                                                                sx={{ 
                                                                    width: '100%', 
                                                                    maxHeight: 150, 
                                                                    objectFit: 'contain',
                                                                    borderRadius: 1,
                                                                    bgcolor: '#f5f5f5'
                                                                }}
                                                                alt={selectedItem.item_name}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={8}>
                                                            <Typography variant="h6">{selectedItem.item_name}</Typography>
                                                            <Typography variant="body2">Category: {selectedItem.category}</Typography>
                                                            <Typography variant="body2">Found at: {selectedItem.location_found}</Typography>
                                                            <Typography variant="body2">
                                                                Date Found: {new Date(selectedItem.date_found).toLocaleDateString()}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                );
                                            })()}
                                        </Paper>
                                    </Box>
                                )}

                                <Typography variant="subtitle1" gutterBottom>
                                    {formData.foundItemId ? "Change selected item:" : "Available items:"}
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    {availableItems.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                                            <Card 
                                                sx={{ 
                                                    cursor: 'pointer',
                                                    border: formData.foundItemId === item.id ? '2px solid #1976d2' : 'none',
                                                    transition: 'transform 0.2s',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: 3
                                                    }
                                                }}
                                                onClick={() => handleItemSelect(item.id)}
                                            >
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={item.image ? `./Backend/${item.image}` : "./no-image.png"}
                                                    alt={item.item_name}
                                                    sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
                                                />
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom>
                                                        {item.item_name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Category: {item.category}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Found at: {item.location_found}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Date Found: {new Date(item.date_found).toLocaleDateString()}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        {item.description}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        )}
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Retrieval Details
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Your Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Your Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                        </Grid>

                        <FormControl component="fieldset" sx={{ mb: 3, mt: 2 }}>
                            <FormLabel component="legend">Delivery Method</FormLabel>
                            <RadioGroup
                                name="deliveryMethod"
                                value={formData.deliveryMethod}
                                onChange={handleDeliveryMethodChange}
                                row
                            >
                                <FormControlLabel value="pickup" control={<Radio />} label="In-Person Pickup" />
                                <FormControlLabel value="shipping" control={<Radio />} label="Shipping to Address" />
                            </RadioGroup>
                        </FormControl>

                        {formData.deliveryMethod === 'pickup' && (
                            <>
                                <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                    <Typography variant="body1">
                                        ⚠️ Please bring a valid ID (UB Card, Driver's License, etc.) when you come to pick up your item.
                                    </Typography>
                                </Box>

                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Pickup Location</InputLabel>
                                    <Select
                                        name="pickupLocation"
                                        value={formData.pickupLocation}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value as string }))}
                                        required
                                        label="Pickup Location"
                                    >
                                        <MenuItem value="Silverman Library">Silverman Library - 3rd floor circulation desk</MenuItem>
                                        <MenuItem value="Student Union">Student Union - Welcome center</MenuItem>
                                        <MenuItem value="Capen Hall">1 Capen Hall</MenuItem>
                                        <MenuItem value="Lockwood Library">Lockwood Library - 2nd floor circulation desk</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Preferred Time for Retrieval"
                                    name="preferredTime"
                                    type="datetime-local"
                                    value={formData.preferredTime.replace(' ', 'T').slice(0, -3) || ''}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </>
                        )}

                        {formData.deliveryMethod === 'shipping' && (
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Shipping Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="County"
                                        name="county"
                                        value={formData.county}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        label="State"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        label="Zip Code"
                                        name="zipcode"
                                        value={formData.zipcode}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                            </Grid>
                        )}

                        <TextField
                            label="Additional Instructions"
                            name="additionalInstructions"
                            value={formData.additionalInstructions}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mb: 3 }}
                        />
                    </Box>
                );
            case 2:
                const selectedItem = availableItems.find(item => item.id === formData.foundItemId);
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Review Your Request
                        </Typography>
                        
                        {/* Selected Item */}
                        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Selected Item
                            </Typography>
                            {selectedItem ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Box 
                                            component="img" 
                                            src={selectedItem.image ? `./Backend/${selectedItem.image}` : "./no-image.png"}
                                            sx={{ 
                                                width: '100%', 
                                                maxHeight: 150, 
                                                objectFit: 'contain',
                                                borderRadius: 1,
                                                bgcolor: '#f5f5f5'
                                            }}
                                            alt={selectedItem.item_name}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <Typography variant="h6">{selectedItem.item_name}</Typography>
                                        <Typography variant="body2">Category: {selectedItem.category}</Typography>
                                        <Typography variant="body2">Found at: {selectedItem.location_found}</Typography>
                                        <Typography variant="body2">
                                            Date Found: {new Date(selectedItem.date_found).toLocaleDateString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Typography color="error">No item selected</Typography>
                            )}
                        </Paper>
                        
                        {/* Contact Information */}
                        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Contact Information
                            </Typography>
                            <Typography variant="body1">Name: {formData.name}</Typography>
                            <Typography variant="body1">Email: {formData.email}</Typography>
                        </Paper>
                        
                        {/* Delivery Method */}
                        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Delivery Method
                            </Typography>
                            <Typography variant="body1">
                                {formData.deliveryMethod === 'pickup' ? 'In-Person Pickup' : 'Shipping to Address'}
                            </Typography>
                            
                            {formData.deliveryMethod === 'pickup' ? (
                                <>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        <strong>Pickup Location:</strong> {formData.pickupLocation}
                                    </Typography>
                                    {formData.preferredTime && (
                                        <Typography variant="body2">
                                            <strong>Preferred Time:</strong> {new Date(formData.preferredTime).toLocaleString()}
                                        </Typography>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        <strong>Shipping Address:</strong> {formData.address}
                                    </Typography>
                                    <Typography variant="body2">
                                        {formData.county}, {formData.state} {formData.zipcode}
                                    </Typography>
                                </>
                            )}
                        </Paper>
                        
                        {/* Additional Instructions */}
                        {formData.additionalInstructions && (
                            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                    Additional Instructions
                                </Typography>
                                <Typography variant="body2">{formData.additionalInstructions}</Typography>
                            </Paper>
                        )}
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <LayoutDefault>
            <Container maxWidth="md" sx={{ my: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h4" gutterBottom align="center">
                        Retrieve Your Item
                    </Typography>
                    
                    <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    
                    <Box>
                        {getStepContent(activeStep)}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                color="inherit"
                                disabled={activeStep === 0 || loading}
                                onClick={handleBack}
                                sx={{ mr: 1 }}
                            >
                                Back
                            </Button>
                            <Box>
                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit}
                                        disabled={loading || !formData.foundItemId}
                                        sx={{ px: 4, py: 1 }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Submit'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        disabled={activeStep === 0 && !formData.foundItemId}
                                        sx={{ px: 4, py: 1 }}
                                    >
                                        Next
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </LayoutDefault>
    );
};

export default RetrieveForm;