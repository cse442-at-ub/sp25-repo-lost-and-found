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
  Alert,
  AlertTitle,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  useTheme,
  Grid,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  CheckCircle, 
  RadioButtonUnchecked,
  LockReset as LockResetIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';

import LayoutDefault from './LayoutDefault';
import { useNavigate } from 'react-router';

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
  const navigate = useNavigate();
  const theme = useTheme();

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Enhanced notification with MUI styling
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
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
  
  // Calculate password strength
  const getPasswordStrength = (): { percent: number; color: string; text: string } => {
    const validCount = Object.values(passwordValidation).filter(Boolean).length;
    
    if (validCount === 0 || newPassword.length === 0) {
      return { percent: 0, color: theme.palette.grey[500], text: 'Not set' };
    }
    
    if (validCount <= 2) {
      return { percent: 20, color: theme.palette.error.main, text: 'Very Weak' };
    }
    
    if (validCount <= 4) {
      return { percent: 40, color: theme.palette.error.main, text: 'Weak' };
    }
    
    if (validCount === 5) {
      return { percent: 70, color: theme.palette.warning.main, text: 'Medium' };
    }
    
    return { percent: 100, color: theme.palette.success.main, text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength();

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
      const response = await fetch('./Backend/changepassword.php', {
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
        
        // Reset password visibility states too
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        
        // Navigate to login page after a short delay to allow the user to see the success message
        setTimeout(() => {
          navigateToLogin();
        }, 2000);
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

  const navigateToLogin = async () => {
    try {
      // Call the logout endpoint to end the session
      const response = await fetch('./Backend/logout.php', {
        method: 'GET',
        credentials: 'include' // Include cookies for session
      });
      
      // Navigate to login page regardless of logout success
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  const handleCancel = () => {
    navigate('/settings');
  };

  return (
    <LayoutDefault>
      <Container component="main" maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleCancel}
            sx={{ position: 'absolute', left: { xs: 16, md: 32 } }}
          >
            Back to Settings
          </Button>
        </Box>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 0, 
            overflow: 'hidden', 
            borderRadius: 2,
            background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
          }}
        >
          <CardHeader 
            title={
              <Box display="flex" alignItems="center" justifyContent="center">
                <SecurityIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h5">Change Password</Typography>
              </Box>
            }
            sx={{ 
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              textAlign: 'center',
              py: 2
            }}
          />
          
          <CardContent sx={{ p: 4 }}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3 }}>Enter Your Passwords</Typography>

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
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockResetIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility(setShowCurrentPassword, showCurrentPassword)}
                              edge="end"
                              size="large"
                            >
                              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 3 }}
                    />
                    
                    <Divider sx={{ my: 3 }} />
                    
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
                        startAdornment: (
                          <InputAdornment position="start">
                            <SecurityIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility(setShowNewPassword, showNewPassword)}
                              edge="end"
                              size="large"
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 1 }}
                    />
                    
                    {/* Password strength indicator */}
                    {newPassword && (
                      <Box sx={{ mt: 1, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">Password Strength</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: passwordStrength.color }}>
                            {passwordStrength.text}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={passwordStrength.percent} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 1,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: passwordStrength.color
                            }
                          }} 
                        />
                      </Box>
                    )}
                    
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
                      error={confirmPassword !== '' && confirmPassword !== newPassword}
                      helperText={confirmPassword !== '' && confirmPassword !== newPassword ? "Passwords don't match" : ""}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SecurityIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility(setShowConfirmPassword, showConfirmPassword)}
                              edge="end"
                              size="large"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 4 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleCancel}
                        disabled={loading}
                        sx={{ py: 1.5 }}
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || !Object.values(passwordValidation).every(Boolean)}
                        sx={{ 
                          py: 1.5,
                          backgroundColor: theme.palette.primary.main,
                          fontWeight: 'bold',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                          }
                        }}
                        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}
                      >
                        {loading ? 'CHANGING PASSWORD...' : 'CHANGE PASSWORD'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      height: '100%', 
                      bgcolor: '#f8f9fa',
                      borderColor: theme.palette.primary.light,
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>Password Requirements</Typography>
                    
                    <List dense>
                      {[
                        { text: 'The length of the password is at least 8', check: passwordValidation.length },
                        { text: 'The password contains at least 1 lowercase letter', check: passwordValidation.lowercase },
                        { text: 'The password contains at least 1 uppercase letter', check: passwordValidation.uppercase },
                        { text: 'The password contains at least 1 number', check: passwordValidation.number },
                        { text: 'The password contains at least 1 of the 12 special characters', check: passwordValidation.specialChar },
                        { text: 'The password does not contain any invalid characters', check: passwordValidation.noInvalidChars }
                      ].map((item, index) => (
                        <ListItem key={index} disableGutters sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 34 }}>
                            {item.check ? (
                              <CheckCircle color="success" />
                            ) : (
                              <RadioButtonUnchecked color="disabled" />
                            )}
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.text} 
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              color: item.check ? 'text.primary' : 'text.secondary'
                            }} 
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Strong passwords are essential for keeping your account secure.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Allowed special characters: <code>! @ # $ % ^ & * ( ) - _</code>
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Paper>
      </Container>

      {/* Notification system using MUI Material */}
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
          sx={{ width: '100%' }}
          elevation={6}
        >
          <AlertTitle>{notification.severity === 'success' ? 'Success' : 'Error'}</AlertTitle>
          {notification.message}
        </Alert>
      </Snackbar>
    </LayoutDefault>
  );
};

export default ChangePassword;