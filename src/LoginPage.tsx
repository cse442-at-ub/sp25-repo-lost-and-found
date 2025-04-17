import React, { useState } from 'react';
import { Box, Button, Link, TextField, Typography, CircularProgress, Alert, Checkbox, FormControlLabel } from '@mui/material';
import LayoutDefault from './LayoutDefault';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';
import * as yup from 'yup';

// Validation schema
const loginSchema = yup.object().shape({
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    agree: yup
        .boolean()
        .oneOf([true], 'You must agree to the terms and conditions')
        .required('You must agree to the terms and conditions')
});

function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        agree: false
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { checkAuthStatus } = useAuth();

    const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = field === 'agree' ? event.target.checked : event.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = async () => {
        try {
            await loginSchema.validate(formData, { abortEarly: false });
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

    const handleLogin = async () => {
        setLoading(true);
        const isValid = await validateForm();
        
        if (!isValid) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('./Backend/login.php', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: formData.email.trim(), 
                    password: formData.password.trim() 
                }),
                credentials: 'include'
            });

            const data = await response.json();
            console.log("Login Response:", data);

            if (response.ok && data.success) {
                await checkAuthStatus();
                navigate('/');
            } else {
                setErrors({ server: data.message || "Invalid credentials." });
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrors({ server: "Server error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LayoutDefault>
            <Box
                sx={{
                    display: 'flex',
                    height: '100vh',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'center',
                    alignItems: 'stretch',
                    bgcolor: '#f5f5f5',
                }}
            >
                {/* Left Panel */}
                <Box
                    sx={{
                        background: 'linear-gradient(180deg, #0d47a1, #1976d2)',
                        flex: 1,
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h4" fontWeight="bold" mb={1}>
                        Welcome to
                    </Typography>
                    <Box component="img" src="/rocket-icon.svg" alt="Logo" sx={{ width: 50, height: 50, mb: 1 }} />
                    <Typography variant="h5" mb={2}>Lost & Found</Typography>
                    <Typography variant="body2" maxWidth={300}>
                        Access your account and hope your items find their home!
                    </Typography>
                </Box>

                {/* Right Panel */}
                <Box
                    sx={{
                        flex: 1,
                        bgcolor: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        px: 4,
                        py: { xs: 4, md: 8 }
                    }}
                >
                    <Typography variant="h5" mb={2} fontWeight="bold">
                        Login to your account
                    </Typography>

                    <TextField
                        label="E-mail Address"
                        variant="standard"
                        fullWidth
                        sx={{ mb: 2, maxWidth: 400 }}
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        error={!!errors.email}
                        helperText={errors.email}
                        disabled={loading}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        variant="standard"
                        fullWidth
                        sx={{ mb: 2, maxWidth: 400 }}
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        error={!!errors.password}
                        helperText={errors.password}
                        disabled={loading}
                    />

                    {errors.server && (
                        <Alert severity="error" sx={{ width: '100%', maxWidth: 400, mb: 2 }}>
                            {errors.server}
                        </Alert>
                    )}

                    <FormControlLabel
                        control={
                            <Checkbox 
                                checked={formData.agree} 
                                onChange={handleInputChange('agree')}
                            />
                        }
                        label={
                            <Typography variant="body2">
                                By Signing In, I Agree with <Link href="#">Terms & Conditions</Link>
                            </Typography>
                        }
                        sx={{ maxWidth: 400, mb: 2 }}
                    />
                    {errors.agree && (
                        <Typography color="error" variant="caption" sx={{ mb: 2 }}>
                            {errors.agree}
                        </Typography>
                    )}

                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ maxWidth: 400, mb: 2, py: 1.2 }}
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Don't have an account? <Link href="./#/register">Register here</Link>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        <Link href="./#/forgot-password">Forgot Password?</Link>
                    </Typography>
                </Box>
            </Box>
        </LayoutDefault>
    );
}

export default LoginPage;
