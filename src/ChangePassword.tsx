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
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LayoutDefault from './LayoutDefault';
import { useNavigate } from 'react-router';

// Define interface for form values
interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Validation schema
const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*()\-_]/, 'Password must contain at least one special character')
    .matches(/^[a-zA-Z0-9!@#$%^&*()_\-]+$/, 'Password contains invalid characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
});

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

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watch('newPassword');
  
  // Calculate password strength
  const getPasswordStrength = (): { percent: number; color: string; text: string } => {
    if (!newPassword) {
      return { percent: 0, color: theme.palette.grey[500], text: 'Not set' };
    }
    
    const validations = {
      length: newPassword.length >= 8,
      lowercase: /[a-z]/.test(newPassword),
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      specialChar: /[!@#$%^&*()\-_]/.test(newPassword),
      noInvalidChars: /^[a-zA-Z0-9!@#$%^&*()_\-]+$/.test(newPassword)
    };
    
    const validCount = Object.values(validations).filter(Boolean).length;
    
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

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      const response = await fetch('./Backend/changepassword.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
  
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setNotification({
          open: true,
          message: result.message || "Password changed successfully",
          severity: 'success'
        });
        
        setTimeout(() => {
          navigateToLogin();
        }, 2000);
      } else {
        setNotification({
          open: true,
          message: result.message || "Failed to change password",
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
      await fetch('./Backend/logout.php', {
        method: 'GET',
        credentials: 'include'
      });
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
              onSubmit={handleSubmit(onSubmit)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3 }}>Enter Your Passwords</Typography>

                    <Controller
                      name="currentPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          label="Current Password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          error={!!errors.currentPassword}
                          helperText={errors.currentPassword?.message}
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
                          {...field}
                        />
                      )}
                    />
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Controller
                      name="newPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          label="New Password"
                          type={showNewPassword ? 'text' : 'password'}
                          error={!!errors.newPassword}
                          helperText={errors.newPassword?.message}
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
                          {...field}
                        />
                      )}
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
                    
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          label="Confirm New Password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword?.message}
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
                          {...field}
                        />
                      )}
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
                        disabled={loading}
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
                        { text: 'The length of the password is at least 8', check: newPassword?.length >= 8 },
                        { text: 'The password contains at least 1 lowercase letter', check: /[a-z]/.test(newPassword || '') },
                        { text: 'The password contains at least 1 uppercase letter', check: /[A-Z]/.test(newPassword || '') },
                        { text: 'The password contains at least 1 number', check: /[0-9]/.test(newPassword || '') },
                        { text: 'The password contains at least 1 of the 12 special characters', check: /[!@#$%^&*()\-_]/.test(newPassword || '') },
                        { text: 'The password does not contain any invalid characters', check: /^[a-zA-Z0-9!@#$%^&*()_\-]+$/.test(newPassword || '') }
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