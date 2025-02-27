import { useState } from "react";
import LayoutDefault from "./LayoutDefault";
import { Container, Typography, Button, Switch, FormControlLabel, Box, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField  } from "@mui/material";
import { useNavigate } from 'react-router'

const Settings = () => {
    const navigate = useNavigate();
    
    // Load user info from local storage or set defaults
    const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    };
  
    // Usage:
    const [userInfo, setUserInfo] = useState(() => getLocalStorageItem("userInfo", {
        firstName: "Jane",
        lastName: "Doe",
        email: "janedoe@example.com",
        phone: "(387) 873-2455",
    }));
    
    const [notifications, setNotifications] = useState(() => getLocalStorageItem("notifications", {
        email: false,
        sms: false,
        push: false,
    }));
    

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
     const handleSave = () => {
      if (!editFieldKey) return;

      if (editFieldKey === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFieldValue)) {
          setSnackbar({ open: true, message: "Invalid email format", severity: "error" });
          return;
      }

      if (editFieldKey === "phone" && !/^\(\d{3}\) \d{3}-\d{4}$/.test(editFieldValue)) {
          setSnackbar({ open: true, message: "Invalid phone format. Use (XXX) XXX-XXXX", severity: "error" });
          return;
      }

      setUserInfo((prev) => ({ ...prev, [editFieldKey]: editFieldValue }));
      setSnackbar({ open: true, message: `${editFieldKey} updated successfully!`, severity: "success" });

      setOpenDialog(false); // Close the dialog
     };


    const toggleNotification = (type: string) => {
      setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));
      setSnackbar({ open: true, message: `${type.toUpperCase()} notifications ${notifications[type] ? 'disabled' : 'enabled'}`, severity: "info" });
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
    const handleConfirmDelete = () => {
        setSnackbar({ open: true, message: "Account deletion request sent.", severity: "warning" });
        setOpenDeleteDialog(false);
    };

    return (
        <LayoutDefault>
            <Container sx={{ margin: 'auto', background: 'white', padding: 3, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h2" gutterBottom>
                    Settings
                </Typography>

                {/*User Information Section */}
                <Box sx={{ borderTop: '1px solid #ddd', paddingBottom: 2, marginBottom: 2  }}>
                    <Typography variant="h5">User Information</Typography>
                    <Box sx={{ marginLeft: 16 }}>
                    {Object.entries(userInfo).map(([key, value]) => (
                        <Box key={key} mt={1} display="flex" alignItems="center">
                            <Typography>
                                {key.charAt(0).toUpperCase() + key.slice(1)}: <span className="info">{value}</span>
                            </Typography>
                            <Button variant="outlined" size="small" sx={{ ml: 2 , backgroundColor: "dodgerBlue", color: "white" }} onClick={() => handleOpenDialog(key)}>
                                Edit
                            </Button>
                        </Box>
                    ))}
                    </Box>
                </Box>

                {/*Notifications */}
                <Box sx={{ borderTop: '1px solid #ddd', paddingBottom: 2, marginBottom: 2 }}>
                    <Typography variant="h5">Preferences</Typography>
                    <Box sx={{ marginLeft: 16 }}>
                    {Object.entries(notifications).map(([key, value]) => (
                        <Box key={key} display="flex" alignItems="center" mt={1}>
                            <FormControlLabel
                                control={<Switch checked={value} onChange={() => toggleNotification(key)} />}
                                label={key.toUpperCase() + " Notifications"}
                            />
                        </Box>
                    ))}
                    </Box>
                </Box>

                {/*Snackbar */}
                <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
                </Snackbar>

                {/*Dialog for Editing User Info */}
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
                        <Button onClick={() => setOpenDialog(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                <Box mt={3} sx={{ borderTop: '1px solid #ddd', paddingBottom: 2 }}>
                    <Typography variant="h5" gutterBottom>Security</Typography>
                    <Box display="flex" justifyContent="flex-start">

                        <Button variant="contained" sx={{ marginLeft: 16 , backgroundColor: "green", color: "white" }} onClick={() => navigate('/reset-password')}>  
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