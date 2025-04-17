import React, { useState } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, TextField, Typography, useMediaQuery, Alert } from "@mui/material";
import RocketIcon from '@mui/icons-material/Rocket'; // Replace with your actual image or icon
import * as yup from 'yup';

// Validation schema
const registerSchema = yup.object().shape({
    firstName: yup
        .string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters'),
    lastName: yup
        .string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters'),
    username: yup
        .string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[!@#$%^&*()\-_=]/, 'Password must contain at least one special character'),
    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match')
});

function RegisterPage() {
  const isMobile = useMediaQuery('(max-width:600px)');

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = async () => {
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach(error => {
          if (error.path) {
            newErrors[error.path] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    const isValid = await validateForm();
    
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("./Backend/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setErrors({ server: data.message || "Registration failed." });
      }
    } catch (error) {
      setErrors({ server: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutDefault>
      <Box
        sx={{
          display: isMobile ? 'block' : 'flex',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {/* Welcome Left Section */}
        <Box
          sx={{
            background: 'linear-gradient(180deg, #0d47a1, #1976d2)',
            color: 'white',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4,
            borderTopLeftRadius: '12px',
            borderBottomLeftRadius: '12px',
          }}
        >
          <RocketIcon sx={{ fontSize: 60 }} />
          <Typography variant="h4" fontWeight="bold" mt={2}>Lost & Found</Typography>
          <Typography align="center" mt={2} maxWidth="300px">
            Welcome to Lost & Found! Sign up to get started.
          </Typography>
        </Box>

        {/* Form Right Section */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: 'white',
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderTopRightRadius: '12px',
            borderBottomRightRadius: '12px',
            boxShadow: isMobile ? 'none' : '0px 4px 20px rgba(0,0,0,0.1)',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Create your account
          </Typography>

          <TextField
            label="First Name"
            variant="standard"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <TextField
            label="Last Name"
            variant="standard"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <TextField
            label="Username"
            variant="standard"
            value={formData.username}
            onChange={handleInputChange('username')}
            error={!!errors.username}
            helperText={errors.username}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <TextField
            label="E-mail Address"
            variant="standard"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <TextField
            label="Password"
            type="password"
            variant="standard"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <TextField
            label="Confirm Password"
            type="password"
            variant="standard"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          />

          {errors.server && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.server}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>
            <Button variant="outlined" disabled={loading}>Sign In</Button>
          </Box>
        </Box>
      </Box>
    </LayoutDefault>
  );
}

export default RegisterPage;
