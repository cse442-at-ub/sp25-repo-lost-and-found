import { useState } from "react";
import LayoutDefault from "./LayoutDefault";
import { Container, Typography, Button, Switch, FormControlLabel, Box } from "@mui/material";
import { useNavigate } from 'react-router'

const Settings = () => {
    const navigate = useNavigate();
    
    const [userInfo, setUserInfo] = useState({
        firstName: "Jane",
        lastName: "Doe",
        email: "janedoe@example.com",
        phone: "(387) 873-2455",
    });

    const [notifications, setNotifications] = useState({
        email: false,
        sms: false,
        push: false,
    });

    const editField = (field: keyof typeof userInfo) => {
        const newValue = prompt(`Edit ${field}:`, userInfo[field]);
        if (newValue && newValue.trim() !== "") {
        setUserInfo((prev) => ({ ...prev, [field]: newValue }));
        }
    };

    const toggleNotification = (type: keyof typeof notifications) => {
        setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    const changePassword = () => {
        alert("Password change functionality to be implemented.");
    };

    const deleteAccount = () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        alert("Account deletion request sent.");
        }
    };

    return (
        <LayoutDefault>
            <Container sx={{ margin: 'auto', background: 'white', padding: 3, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h2" gutterBottom>
                    Settings
                </Typography>

                {/* User Information Section */}
                <Box sx={{ borderTop: '1px solid #ddd', paddingBottom: 2, marginBottom: 2  }}>
                    <Typography variant="h5">User Information</Typography>
                    <Box sx={{ marginLeft: 16 }}>
                    {Object.entries(userInfo).map(([key, value]) => (
                    <Box key={key} mt={1} display="flex" alignItems="center">
                        <Typography>
                        {key.charAt(0).toUpperCase() + key.slice(1)}: <span className="info">{value}</span>
                        </Typography>
                        <Button variant="outlined" size="small" sx={{ ml: 2 , color: "white", backgroundColor: "dodgerBlue", "&:hover": { backgroundColor: "royalBlue" }}} onClick={() => editField(key)}>
                        Edit
                        </Button>
                    </Box>
                    ))}
                    </Box>
                </Box>

                {/* Preferences Section */}
                <Box sx={{ borderTop: '1px solid #ddd', paddingBottom: 2, marginBottom: 2 }}>
                    <Typography variant="h5">Preferences</Typography>
                    <Box sx={{ marginLeft: 16 }}>
                    {Object.entries(notifications).map(([key, value]) => (
                    <Box key={key} display="flex" alignItems="center" mt={1} className="toggle-group">
                        <FormControlLabel
                        control={<Switch checked={value} onChange={() => toggleNotification(key)} />}
                        label={key.toUpperCase() + " Notifications"}
                        />
                    </Box>
                    ))}
                    </Box>
                </Box>

                {/* Security Section */}
                <Box mt={3} sx={{ borderTop: '1px solid #ddd', paddingBottom: 2 }}>
                    {/* Security Typography */}
                    <Typography variant="h5" gutterBottom>
                    Security
                    </Typography>

                    <Box mb={3} />

                    <Box display="flex" justifyContent="flex-start">
                    <Button 
                        variant="contained" 
                        sx={{marginLeft: 16 , backgroundColor: "green", color: "white", "&:hover": { backgroundColor: "darkgreen" } }} 
                        onClick={() => navigate('/reset-password')}
                    >
                        Change Password
                    </Button>
                    </Box>
                </Box>

                {/* Delect Account Section */}
                <Box mt={3} sx={{ borderTop: '1px solid #ddd', paddingBottom: 2 }}>
                    {/* Security Typography */}
                    <Typography variant="h5" gutterBottom>
                    Danger Zone
                    </Typography>

                    <Box mb={3} />

                    {/* Buttons */}
                    <Box display="flex" justifyContent="flex-start">
                    <Button 
                        variant="contained" 
                        sx={{marginLeft: 16 , backgroundColor: "red", color: "white", "&:hover": { backgroundColor: "darkred" } }} 
                        onClick={deleteAccount}
                    >
                        Delete Account
                    </Button>
                    </Box>
                </Box>
            </Container>
        </LayoutDefault>
    );
};

export default Settings;