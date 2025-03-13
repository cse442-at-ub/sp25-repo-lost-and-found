import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  CheckCircle, 
  RadioButtonUnchecked 
} from '@mui/icons-material';

import LayoutDefault from './LayoutDefault';

// Define interface for password validation
interface PasswordValidation {
  length: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  specialChar: boolean;
  noInvalidChars: boolean;
}

// Define interface for API response
interface ApiResponse {
  success: boolean;
  message: string;
}

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Password validation criteria
  const specialCharacters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_'];
  
  const validatePassword = (password: string): PasswordValidation => {
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: specialCharacters.some(char => password.includes(char)),
      noInvalidChars: /^[a-zA-Z0-9!@#$%^&*()_\-]+$/.test(password)
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Frontend validation
    if (newPassword !== confirmPassword) {
      setNotification({
        open: true,
        message: "Passwords do not match",
        severity: 'error'
      });
      return;
    }

    const isValidPassword = Object.values(passwordValidation).every(Boolean);
    
    if (!isValidPassword) {
      setNotification({
        open: true,
        message: "Please meet all password requirements",
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Updated API endpoint
      const response = await fetch('https://se-prod.cse.buffalo.edu/CSE442/2025-Spring/cse-442s/Backend/changepassword.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        }),
        credentials: 'include' // Include cookies for session authentication
      });

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        // Password change was successful
        setNotification({
          open: true,
          message: data.message || "Password changed successfully",
          severity: 'success'
        });
        
        // Reset form fields after successful password change
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        // Password change failed
        setNotification({
          open: true,
          message: data.message || "Failed to change password",
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setNotification({
        open: true,
        message: "An error occurred while changing your password",
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (
    setter: React.Dispatch<React.SetStateAction<boolean>>, 
    currentState: boolean
  ) => {
    setter(!currentState);
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <LayoutDefault>
      <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={0} sx={{ py: 4, px: 3 }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ width: '100%', mb: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="current-password"
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility(setShowCurrentPassword, showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="new-password"
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility(setShowNewPassword, showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirm-password"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility(setShowConfirmPassword, showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Password Requirements:
              </Typography>
              <List dense>
                {[
                  { text: 'The length of the password is at least 8', check: passwordValidation.length },
                  { text: 'The password contains at least 1 lowercase letter', check: passwordValidation.lowercase },
                  { text: 'The password contains at least 1 uppercase letter', check: passwordValidation.uppercase },
                  { text: 'The password contains at least 1 number', check: passwordValidation.number },
                  { text: 'The password contains at least 1 of the 12 special characters', check: passwordValidation.specialChar },
                  { text: 'The password does not contain any invalid characters', check: passwordValidation.noInvalidChars }
                ].map((item, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemIcon>
                      {item.check ? <CheckCircle color="success" /> : <RadioButtonUnchecked color="disabled" />}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 1, 
                mb: 2, 
                py: 1.5,
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                }
              }}
            >
              {loading ? 'CHANGING PASSWORD...' : 'CHANGE PASSWORD'}
            </Button>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 2, 
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
              onClick={navigateToLogin}
            >
              Return to Login
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Notification system */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </LayoutDefault>
  );
};

export default ChangePassword;