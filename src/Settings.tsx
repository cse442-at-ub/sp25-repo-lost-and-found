import { useState,  useEffect } from "react";
import LayoutDefault from "./LayoutDefault";
import { Container, Typography, Button, Switch, FormControlLabel, Box, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useNavigate } from 'react-router'

const Settings = () => {
    const navigate = useNavigate();
    
     // State for user information (initially empty)
     const [userInfo, setUserInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // State for notification preferences (initially false)
    const [notifications, setNotifications] = useState({
        email: false,
        sms: false,
        push: false,
    });

    // State for Snackbar feedback
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        severity: "error" | "warning" | "info" | "success";
        message: string;
      }>({
          open: false,
          severity: "info",
          message: "",
      });

    // Function to fetch user data from backend
    const fetchUserData = async () => {
        try {
            const response = await fetch("https://se-prod.cse.buffalo.edu/CSE442/2025-Spring/cse-442s/Backend/settings.php");
    
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
                    navigate('/login'); // Redirect to login page
                    return;
                }
                /*
                //check is session is active and users is authorized
                if(response.status === 401){
                    setSnackbar({
                        open: true,
                        message: "You are not authorized to view this page. Redirecting to login...",
                        severity: "warning",
                    });
                    localStorage.clear(); // Clear stored user data
                    navigate('/login'); // Redirect to login page
                }
                */
    
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
        }
    };
    
    
    // Fetch data when component mounts
    useEffect(() => {
        fetchUserData();
    }, []);
    
    
    
    useEffect(() => {
        fetchUserData();
    }, []); // Call the function when the component mounts
    

    

    //State for handling dialog input
    const [openDialog, setOpenDialog] = useState(false);
    const [editFieldKey, setEditFieldKey] = useState<string | null>(null);
    const [editFieldValue, setEditFieldValue] = useState<string>("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    useEffect(() => {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
    }, [userInfo]);

    useEffect(() => {
        localStorage.setItem("notifications", JSON.stringify(notifications));
    }, [notifications]);

    // Open the dialog instead of using prompt
    const handleOpenDialog = (field: string) => {
      setEditFieldKey(field);
      setEditFieldValue(userInfo[field]); // Load existing value
      setOpenDialog(true);
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setEditFieldValue(event.target.value);
  };

    // Save changes & validate inside the dialog
    const handleSaveToDB = async (updatedData: any, type: "userInfo" | "notifications") => {
        try {
            console.log("Saving data to backend:", JSON.stringify({ data: updatedData, type }));
    
            const response = await fetch("https://se-prod.cse.buffalo.edu/CSE442/2025-Spring/cse-442s/Backend/settings.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: updatedData, type }), // No user_id sent
            });
    
            console.log("Response status:", response.status);
    
            let text = await response.text();
            try {
                const data = JSON.parse(text);
                console.log("Parsed JSON:", data);
            } catch (error) {
                console.error("Invalid JSON:", text);
                throw new Error("Server returned an invalid response");
            }

    
            if (!text.startsWith("{") && !text.startsWith("[")) {
                throw new Error("Invalid JSON response: " + text);
            }
    
            const data = JSON.parse(text);
            console.log("Parsed JSON:", data);
    
            if (data.success) {
                setSnackbar({ open: true, message: "Settings saved successfully!", severity: "success" });
                return true;
            } else {
                setSnackbar({ open: true, message: `Failed to save settings: ${data.message}`, severity: "error" });
                return false;
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            setSnackbar({ open: true, message: "An error occurred while saving settings.", severity: "error" });
            return false;
        }
    };
    
    
    
    

    const handleSave = async () => {
        if (!editFieldKey) return;
    
        if (editFieldKey === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFieldValue)) {
            setSnackbar({ open: true, message: "Invalid email format", severity: "error" });
            return;
        }
    
        if (editFieldKey === "phone" && editFieldValue !== "" && !/^\(\d{3}\) \d{3}-\d{4}$/.test(editFieldValue)) {
            setSnackbar({ open: true, message: "Invalid phone format. Use (XXX) XXX-XXXX", severity: "error" });
            return;
        }
    
        const updatedUserInfo = { ...userInfo, [editFieldKey]: editFieldValue };
    
        // Try to save to DB first
        const saveSuccessful = await handleSaveToDB(updatedUserInfo, "userInfo");
    
        if (saveSuccessful) {
            setUserInfo(updatedUserInfo);
            setSnackbar({ open: true, message: `${editFieldKey} updated successfully!`, severity: "success" });
        }
    
        setOpenDialog(false); // Close the dialog
    };
    



    const toggleNotification = async (type: string) => {
        const updatedNotifications = { ...notifications, [type]: !notifications[type] };
        setNotifications(updatedNotifications); // Update UI immediately
    
        const saveSuccessful = await handleSaveToDB(updatedNotifications, "notifications");
    
        if (!saveSuccessful) {
            // Revert change if API call fails
            setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));
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
            const userId = 1; // Replace with actual logged-in user ID
            console.log("Sending account deletion request for user:", userId);
    
            const response = await fetch(`https://se-prod.cse.buffalo.edu/CSE442/2025-Spring/cse-442s/Backend/settings.php`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, confirm: true }), // Required for deletion
            });
    
            console.log("Response status:", response.status);
    
            const text = await response.text();
            console.log("Raw response text:", text);
    
            const data = JSON.parse(text);
            console.log("Parsed JSON:", data);
    
            if (data.success) {
                setSnackbar({ open: true, message: "Account deleted successfully. Redirecting...", severity: "warning" });
                setOpenDeleteDialog(false);
    
      
                setTimeout(() => {
                    // Redirects user to home page
                    navigate('/login');      
                
                }, 3000);
            } else {
                setSnackbar({ open: true, message: `Failed to delete account: ${data.message}`, severity: "error" });
                setOpenDeleteDialog(false);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            setSnackbar({ open: true, message: "An error occurred while deleting the account.", severity: "error" });
        }
    };
    
    return (
        <LayoutDefault>
            <Container sx={{ margin: 'auto', background: 'white', padding: 3, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h2" gutterBottom>
                Settings
                </Typography>

                {/* 🔵 User Information Section */}
                <Box sx={{ borderTop: '1px solid #ddd', paddingBottom: 2, marginBottom: 2 }}>
                    <Typography variant="h5">User Information</Typography>
                    <Box sx={{ marginLeft: 16 }}>
                        {Object.entries(userInfo).map(([key, value]) => (
                            <Box key={key} mt={1} display="flex" alignItems="center">
                                <Typography>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}: <span className="info">{value}</span>
                                </Typography>
                                <Button variant="outlined" size="small" sx={{ ml: 2, backgroundColor: "dodgerBlue", color: "white" }} onClick={() => handleOpenDialog(key)}>
                                    Edit
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Notifications */}
                <Box sx={{ borderTop: '1px solid #ddd', paddingBottom: 2, marginBottom: 2 }}>
                    <Typography variant="h5">Preferences</Typography>
                    <Box sx={{ marginLeft: 16 }}>
                        {Object.entries(notifications).map(([key, value]) => (
                            <Box key={key} display="flex" alignItems="center" mt={1}>
                                <FormControlLabel
                                    control={<Switch checked={value} onChange={() => toggleNotification(key)}/>}
                                    label={key.toUpperCase() + " Notifications"}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Snackbar */}
                <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
                </Snackbar>

                {/* Dialog for Editing User Info */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>Edit {editFieldKey}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="edit-field"
                            label={editFieldKey}
                            type="text"
                            fullWidth
                            value={editFieldValue}
                            onChange={handleInputChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)} color="primary">Cancel</Button>
                        <Button onClick={handleSave} color="primary">Save</Button>
                    </DialogActions>
                </Dialog>
                    {/*Security*/}
                <Box mt={3} sx={{ borderTop: '1px solid #ddd', paddingBottom: 2 }}>
                    <Typography variant="h5" gutterBottom>Security</Typography>
                    <Box display="flex" justifyContent="flex-start">

                        <Button variant="contained" sx={{ marginLeft: 16 , backgroundColor: "green", color: "white" }} onClick={() => navigate('/change-password')} >   {/* onClick={() => navigate('/reset-password')}  */}
                            Change Password
                        </Button>
                    </Box>
                </Box>

                <Box mt={3} sx={{ borderTop: '1px solid #ddd', paddingBottom: 2 }}>
                    <Typography variant="h5" gutterBottom>Danger Zone</Typography>
                    <Box display="flex" justifyContent="flex-start">
                        <Button variant="contained" sx={{ marginLeft: 16 , backgroundColor: "red", color: "white" }} onClick={deleteOpenDialog}>
                            Delete Account
                        </Button>
                    </Box>
                </Box>

                {/* Delete Account Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={deleteCloseDialog}>
                <DialogTitle>Confirm Account Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete your account? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={deleteCloseDialog} color="primary" variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
                </Snackbar>
                
            </Container>
        </LayoutDefault>
    );
};

export default Settings;