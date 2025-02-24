import { useState } from "react";
import LayoutDefault from "./LayoutDefault";
import { Container, Typography, Button, Switch, FormControlLabel, Box, Paper } from "@mui/material";
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
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
            <Typography variant="h5" gutterBottom>
                Settings
            </Typography>

            {/* User Information Section */}
            <Box mt={2}>
                <Typography variant="h6">User Information</Typography>
                {Object.entries(userInfo).map(([key, value]) => (
                <Box key={key} mt={1} display="flex" alignItems="center">
                    <Typography>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</Typography>
                    <Button variant="outlined" size="small" sx={{ ml: 2 }} onClick={() => editField(key as keyof typeof userInfo)}>
                    Edit
                    </Button>
                </Box>
                ))}
            </Box>

            {/* Preferences Section */}
            <Box mt={3}>
                <Typography variant="h6">Preferences</Typography>
                {Object.entries(notifications).map(([key, value]) => (
                <FormControlLabel
                    key={key}
                    control={<Switch checked={value} onChange={() => toggleNotification(key as keyof typeof notifications)} />}
                    label={key.charAt(0).toUpperCase() + key.slice(1) + " Notifications"}
                />
                ))}
            </Box>

            {/* Security Section */}
            <Box mt={3}>
                <Typography variant="h6">Security</Typography>
                <Button variant="contained" color="primary" sx={{ mt: 1 }} onClick={() => navigate('/reset-password')}>
                Change Password
                </Button>
            </Box>

            {/* Danger Zone Section */}
            <Box mt={3}>
                <Typography variant="h6" color="error">Danger Zone</Typography>
                <Button variant="contained" color="error" sx={{ mt: 1 }} onClick={deleteAccount}>
                Delete Account
                </Button>
            </Box>
            </Paper>
        </Container>
        </LayoutDefault>
    );
};

export default Settings;