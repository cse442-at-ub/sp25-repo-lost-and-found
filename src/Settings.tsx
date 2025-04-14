import { useState, useEffect } from "react";
import LayoutDefault from "./LayoutDefault";
import { 
  Container,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Divider,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Avatar,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router';

const Settings = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // State for user information
    const [userInfo, setUserInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // State for notification preferences
    const [notifications, setNotifications] = useState({
        email: false,
        sms: false,
        push: false,
    });

    // State for Snackbar feedback
    const [snackbar, setSnackbar] = useState({
        open: false,
        severity: "info" as "error" | "warning" | "info" | "success",
        message: "",
    });

    // State for loading indicator
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // States for dialogs
    const [openDialog, setOpenDialog] = useState(false);
    const [editFieldKey, setEditFieldKey] = useState<string | null>(null);
    const [editFieldValue, setEditFieldValue] = useState<string>("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // Function to fetch user data from backend
    const fetchUserData = async () => {
        try {
            setPageLoading(true);
            const response = await fetch("./Backend/settings.php");
    
            const data = await response.json();
    
            if (data.error) {
                // If user is deleted, redirect to login
                if (response.status === 403) {
                    setSnackbar({
                        open: true,
                        message: "Your account has been deleted. Redirecting to login...",
                        severity: "warning",
                    });
                    localStorage.clear(); // Clear stored user data
                    setTimeout(() => navigate('/login'), 1500); // Redirect to login page
                    return;
                }
                
                // If unauthorized, redirect to login
                if(response.status === 401){
                    setSnackbar({
                        open: true,
                        message: "You are not authorized to view this page. Redirecting to login...",
                        severity: "warning",
                    });
                    localStorage.clear(); // Clear stored user data
                    setTimeout(() => navigate('/login'), 1500); // Redirect to login page
                    return;
                }
    
                setSnackbar({
                    open: true,
                    message: data.error,
                    severity: "error",
                });
                return;
            }
    
            setUserInfo({
                firstName: data.user_info.first_name || "",
                lastName: data.user_info.last_name || "",
                email: data.user_info.email || "",
                phone: data.user_info.phone_number || "",
            });
    
            setNotifications({
                email: Boolean(data.notifications.email_notif),
                sms: Boolean(data.notifications.sms_notif),
                push: Boolean(data.notifications.push_notif),
            });
    
        } catch (error) {
            console.error("Error fetching user data:", error);
            setSnackbar({
                open: true,
                message: "Failed to load user data. Please try again later.",
                severity: "error",
            });
        } finally {
            setPageLoading(false);
        }
    };
    
    // Fetch data when component mounts
    useEffect(() => {
        fetchUserData();
    }, []);
    
    useEffect(() => {
        if (userInfo) {
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
        }
    }, [userInfo]);

    useEffect(() => {
        if (notifications) {
            localStorage.setItem("notifications", JSON.stringify(notifications));
        }
    }, [notifications]);

    // Open the dialog instead of using prompt
    const handleOpenDialog = (field: string) => {
        setEditFieldKey(field);
        setEditFieldValue(userInfo[field as keyof typeof userInfo]); // Load existing value
        setOpenDialog(true);
    };

    // Handle input change
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditFieldValue(event.target.value);
    };

    // Save changes & validate inside the dialog
    const handleSaveToDB = async (updatedData: any, type: "userInfo" | "notifications") => {
        try {
            setIsLoading(true);
    
            const response = await fetch("./Backend/settings.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: updatedData, type }),
                credentials: 'include' // Include cookies for session
            });
    
            // Check for specific HTTP status codes first
            if (response.status === 409) {
                // 409 Conflict - Email or phone already in use
                const data = await response.json();
                setSnackbar({ 
                    open: true, 
                    message: data.error || "Email or phone number is already in use by another user", 
                    severity: "error" 
                });
                return false;
            }
            
            if (response.status === 401) {
                // 401 Unauthorized - Session expired
                setSnackbar({
                    open: true,
                    message: "Session expired. Please log in again.",
                    severity: "error"
                });
                setTimeout(() => navigate('/login'), 1500);
                return false;
            }
    
            let text = await response.text();
            try {
                const data = JSON.parse(text);
                
                if (data.success) {
                    setSnackbar({ open: true, message: "Settings saved successfully!", severity: "success" });
                    return true;
                } else {
                    setSnackbar({ 
                        open: true, 
                        message: data.error || "Failed to save settings", 
                        severity: "error" 
                    });
                    return false;
                }
            } catch (error) {
                console.error("Invalid JSON:", text);
                setSnackbar({ 
                    open: true, 
                    message: "Server returned an invalid response", 
                    severity: "error" 
                });
                return false;
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            setSnackbar({ 
                open: true, 
                message: "An error occurred while saving settings", 
                severity: "error" 
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = async () => {
        if (!editFieldKey) return;
    
        // Client-side validation
        if (editFieldKey === "firstName" || editFieldKey === "lastName") {
            if (!editFieldValue.trim()) {
                setSnackbar({ 
                    open: true, 
                    message: `${editFieldKey === "firstName" ? "First name" : "Last name"} cannot be empty`, 
                    severity: "error" 
                });
                return;
            }
        }
        
        if (editFieldKey === "email") {
            if (!editFieldValue.trim()) {
                setSnackbar({ 
                    open: true, 
                    message: "Email cannot be empty", 
                    severity: "error" 
                });
                return;
            }
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFieldValue)) {
                setSnackbar({ 
                    open: true, 
                    message: "Invalid email format", 
                    severity: "error" 
                });
                return;
            }
        }
    
        if (editFieldKey === "phone" && editFieldValue !== "" && !/^\(\d{3}\) \d{3}-\d{4}$/.test(editFieldValue)) {
            setSnackbar({ 
                open: true, 
                message: "Invalid phone format. Use (XXX) XXX-XXXX", 
                severity: "error" 
            });
            return;
        }
    
        const updatedUserInfo = { ...userInfo, [editFieldKey]: editFieldValue };
    
        // Try to save to DB
        const saveSuccessful = await handleSaveToDB(updatedUserInfo, "userInfo");
    
        if (saveSuccessful) {
            setUserInfo(updatedUserInfo);
        }
    
        setOpenDialog(false); // Close the dialog
    };

    const toggleNotification = async (type: string) => {
        const updatedNotifications = { 
            ...notifications, 
            [type]: !notifications[type as keyof typeof notifications] 
        };
        
        // Update UI immediately
        setNotifications(updatedNotifications);
    
        const saveSuccessful = await handleSaveToDB(updatedNotifications, "notifications");
    
        if (saveSuccessful) {
            // Notify other components about settings change
            window.dispatchEvent(new Event('notificationSettingsChanged'));
        } else {
            // Revert change if API call fails
            setNotifications((prev) => ({ 
                ...prev, 
                [type]: !prev[type as keyof typeof notifications] 
            }));
        }
    };
    
    // Open the confirmation dialog
    const deleteOpenDialog = () => {
        setOpenDeleteDialog(true);
    };

    // Close the confirmation dialog
    const deleteCloseDialog = () => {
        setOpenDeleteDialog(false);
    };

    // Handle account deletion
    const handleConfirmDelete = async () => {
        try {
            setIsLoading(true);
    
            const response = await fetch("./Backend/settings.php", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: 'include' // Include cookies for session
            });
    
            const data = await response.json();
    
            if (data.success) {
                setSnackbar({ 
                    open: true, 
                    message: "Account deleted successfully. Redirecting...", 
                    severity: "warning" 
                });
                setOpenDeleteDialog(false);
    
                setTimeout(() => {
                    localStorage.clear(); // Clear stored data
                    navigate('/login');      
                }, 3000);
            } else {
                setSnackbar({ 
                    open: true, 
                    message: data.error || "Failed to delete account", 
                    severity: "error" 
                });
                setOpenDeleteDialog(false);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            setSnackbar({ 
                open: true, 
                message: "An error occurred while deleting the account", 
                severity: "error" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <LayoutDefault>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            </LayoutDefault>
        );
    }
    
    return (
        <LayoutDefault>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{ 
                        mb: 4, 
                        fontWeight: 'bold',
                        color: theme.palette.primary.main,
                        textAlign: 'center' 
                    }}
                >
                    Account Settings
                </Typography>

                <Grid container spacing={3}>
                    {/* Profile Information Section */}
                    <Grid item xs={12} md={5}>
                        <Card elevation={1} sx={{ mb: 2 }}>
                            <CardHeader 
                                title={
                                    <Box display="flex" alignItems="center">
                                        <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                                        <Typography variant="h6">Profile Information</Typography>
                                    </Box>
                                }
                                sx={{ 
                                    backgroundColor: theme.palette.primary.light,
                                    color: theme.palette.primary.contrastText,
                                    py: 1.5
                                }}
                            />
                            <CardContent sx={{ pt: 2, pb: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: theme.palette.primary.main,
                                            width: 60,
                                            height: 60,
                                            fontSize: 24,
                                            mr: 2
                                        }}
                                    >
                                        {userInfo.firstName.charAt(0)}{userInfo.lastName.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {userInfo.firstName} {userInfo.lastName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {userInfo.email}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Divider sx={{ my: 1.5 }} />

                                <Box sx={{ mt: 2 }}>
                                    <Grid container spacing={1.5}>
                                        <Grid item xs={12}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: '#f5f5f5'
                                            }}>
                                                <Box display="flex" alignItems="center">
                                                    <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">First Name</Typography>
                                                        <Typography variant="body2">{userInfo.firstName}</Typography>
                                                    </Box>
                                                </Box>
                                                <Tooltip title="Edit first name">
                                                    <IconButton 
                                                        color="primary" 
                                                        size="small" 
                                                        onClick={() => handleOpenDialog("firstName")}
                                                        disabled={isLoading}
                                                        sx={{ 
                                                            bgcolor: 'rgba(25, 118, 210, 0.1)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(25, 118, 210, 0.2)',
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Grid>
                                        
                                        <Grid item xs={12}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: '#f5f5f5'
                                            }}>
                                                <Box display="flex" alignItems="center">
                                                    <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Last Name</Typography>
                                                        <Typography variant="body2">{userInfo.lastName}</Typography>
                                                    </Box>
                                                </Box>
                                                <Tooltip title="Edit last name">
                                                    <IconButton 
                                                        color="primary" 
                                                        size="small" 
                                                        onClick={() => handleOpenDialog("lastName")}
                                                        disabled={isLoading}
                                                        sx={{ 
                                                            bgcolor: 'rgba(25, 118, 210, 0.1)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(25, 118, 210, 0.2)',
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Grid>
                                        
                                        <Grid item xs={12}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: '#f5f5f5'
                                            }}>
                                                <Box display="flex" alignItems="center">
                                                    <EmailIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                                        <Typography variant="body2">{userInfo.email}</Typography>
                                                    </Box>
                                                </Box>
                                                <Tooltip title="Edit email">
                                                    <IconButton 
                                                        color="primary" 
                                                        size="small" 
                                                        onClick={() => handleOpenDialog("email")}
                                                        disabled={isLoading}
                                                        sx={{ 
                                                            bgcolor: 'rgba(25, 118, 210, 0.1)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(25, 118, 210, 0.2)',
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Grid>
                                        
                                        <Grid item xs={12}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: '#f5f5f5'
                                            }}>
                                                <Box display="flex" alignItems="center">
                                                    <PhoneIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                                                        <Typography variant="body2">
                                                            {userInfo.phone || "Not set"}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Tooltip title="Edit phone">
                                                    <IconButton 
                                                        color="primary" 
                                                        size="small" 
                                                        onClick={() => handleOpenDialog("phone")}
                                                        disabled={isLoading}
                                                        sx={{ 
                                                            bgcolor: 'rgba(25, 118, 210, 0.1)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(25, 118, 210, 0.2)',
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} md={7}>
                        <Grid container spacing={2} direction="column">
                            {/* Notifications */}
                            <Grid item>
                                <Card elevation={1}>
                                    <CardHeader 
                                        title={
                                            <Box display="flex" alignItems="center">
                                                <NotificationsIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                                                <Typography variant="h6">Notification Preferences</Typography>
                                            </Box>
                                        }
                                        sx={{ 
                                            backgroundColor: theme.palette.secondary.light,
                                            color: theme.palette.secondary.contrastText,
                                            py: 1.5
                                        }}
                                    />
                                    <CardContent sx={{ pt: 2, pb: 1 }}>
                                        <Grid container spacing={1}>
                                            {Object.entries(notifications).map(([key, value]) => (
                                                <Grid item xs={12} key={key}>
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center',
                                                        p: 1.5,
                                                        borderRadius: 1,
                                                        bgcolor: '#f5f5f5'
                                                    }}>
                                                        <Typography variant="body2">
                                                            {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                                                        </Typography>
                                                        <Switch 
                                                            checked={value} 
                                                            onChange={() => toggleNotification(key)}
                                                            disabled={isLoading}
                                                            color="primary"
                                                            size="small"
                                                        />
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Security */}
                            <Grid item>
                                <Card elevation={1}>
                                    <CardHeader 
                                        title={
                                            <Box display="flex" alignItems="center">
                                                <SecurityIcon sx={{ mr: 1, color: 'success.main' }} />
                                                <Typography variant="h6">Security</Typography>
                                            </Box>
                                        }
                                        sx={{ 
                                            backgroundColor: 'success.light',
                                            color: 'success.contrastText',
                                            py: 1.5
                                        }}
                                    />
                                    <CardContent sx={{ pt: 2, pb: 2 }}>
                                        <Button 
                                            variant="contained" 
                                            fullWidth
                                            color="success"
                                            onClick={() => navigate('/change-password')}
                                            disabled={isLoading}
                                            startIcon={<SecurityIcon />}
                                            sx={{ 
                                                py: 1,
                                                fontWeight: 'medium',
                                                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            }}
                                        >
                                            Change Password
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Danger Zone */}
                            <Grid item>
                                <Card elevation={1} sx={{ borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
                                    <CardHeader 
                                        title={
                                            <Box display="flex" alignItems="center">
                                                <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
                                                <Typography variant="h6">Danger Zone</Typography>
                                            </Box>
                                        }
                                        sx={{ 
                                            backgroundColor: 'error.light',
                                            color: 'error.contrastText',
                                            py: 1.5
                                        }}
                                    />
                                    <CardContent sx={{ pt: 2, pb: 2 }}>
                                        <Typography variant="body2" paragraph sx={{ color: 'text.secondary', mb: 2 }}>
                                            Deleting your account will permanently remove all your data from our system.
                                            This action cannot be undone.
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            fullWidth
                                            color="error"
                                            onClick={deleteOpenDialog}
                                            disabled={isLoading}
                                            startIcon={<WarningIcon />}
                                            sx={{ 
                                                py: 1,
                                                fontWeight: 'medium',
                                                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            }}
                                        >
                                            Delete Account
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Dialog for Editing User Info */}
                <Dialog open={openDialog} onClose={() => !isLoading && setOpenDialog(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>
                        Edit {editFieldKey === "firstName" 
                            ? "First Name" 
                            : editFieldKey === "lastName" 
                                ? "Last Name" 
                                : editFieldKey}
                    </DialogTitle>
                    <DialogContent dividers>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="edit-field"
                            label={editFieldKey === "firstName" 
                                ? "First Name" 
                                : editFieldKey === "lastName" 
                                    ? "Last Name" 
                                    : editFieldKey}
                            type="text"
                            fullWidth
                            value={editFieldValue}
                            onChange={handleInputChange}
                            error={
                                (editFieldKey === "email" && editFieldValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFieldValue)) ||
                                (editFieldKey === "phone" && editFieldValue && !/^\(\d{3}\) \d{3}-\d{4}$/.test(editFieldValue))
                            }
                            helperText={
                                (editFieldKey === "email" && editFieldValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFieldValue)) 
                                    ? "Invalid email format" 
                                    : (editFieldKey === "phone" && editFieldValue && !/^\(\d{3}\) \d{3}-\d{4}$/.test(editFieldValue)) 
                                        ? "Format: (XXX) XXX-XXXX" 
                                        : ""
                            }
                            InputProps={{
                                startAdornment: editFieldKey === "email" ? <EmailIcon color="action" sx={{ mr: 1 }} /> : 
                                               editFieldKey === "phone" ? <PhoneIcon color="action" sx={{ mr: 1 }} /> :
                                               <PersonIcon color="action" sx={{ mr: 1 }} />
                            }}
                            disabled={isLoading}
                            size="small"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={() => setOpenDialog(false)} 
                            color="inherit" 
                            disabled={isLoading}
                            size="small"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            color="primary" 
                            variant="contained"
                            startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                            disabled={isLoading || 
                                (editFieldKey === "email" && editFieldValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFieldValue)) || 
                                (editFieldKey === "phone" && editFieldValue && !/^\(\d{3}\) \d{3}-\d{4}$/.test(editFieldValue)) ||
                                (["firstName", "lastName", "email"].includes(editFieldKey || "") && !editFieldValue.trim())
                            }
                            size="small"
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Account Confirmation Dialog */}
                <Dialog 
                    open={openDeleteDialog} 
                    onClose={() => !isLoading && deleteCloseDialog()}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{
                        sx: { 
                            borderTop: '4px solid',
                            borderColor: 'error.main'
                        }
                    }}
                >
                    <DialogTitle sx={{ bgcolor: 'error.light', color: 'error.contrastText', display: 'flex', alignItems: 'center' }}>
                        <WarningIcon sx={{ mr: 1 }} />
                        Delete Account Permanently
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography variant="body2" paragraph>
                            Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data from our system, including:
                        </Typography>
                        
                        <Box component="ul" sx={{ pl: 2 }}>
                            <Typography component="li" variant="body2">All your personal information</Typography>
                            <Typography component="li" variant="body2">Lost and found item reports</Typography>
                            <Typography component="li" variant="body2">Claims history</Typography>
                            <Typography component="li" variant="body2">Notification preferences</Typography>
                        </Box>
                        
                        <Typography variant="body2" paragraph sx={{ mt: 2, fontWeight: 'bold', color: 'error.main' }}>
                            This action is permanent and cannot be reversed.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={deleteCloseDialog} 
                            color="inherit" 
                            disabled={isLoading}
                            size="small"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleConfirmDelete} 
                            color="error" 
                            variant="contained" 
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={16} /> : <WarningIcon />}
                            size="small"
                        >
                            {isLoading ? "Deleting..." : "Delete My Account"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Feedback Snackbar */}
                <Snackbar 
                    open={snackbar.open} 
                    autoHideDuration={6000} 
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    sx={{ mb: 2 }}
                >
                    <Alert 
                        severity={snackbar.severity}
                        variant="filled"
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        sx={{ width: '100%', boxShadow: 3 }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </LayoutDefault>
    );
};

export default Settings;