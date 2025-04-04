import React, { useState } from 'react';
import { Box, Button, Link, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import LayoutDefault from './LayoutDefault';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { checkAuthStatus } = useAuth();

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleLogin = async () => {
        setError("");
        setLoading(true);
        if (!email || !password) {
            setError('Email and password are required.');
            setLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            setError('Invalid email format.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('./Backend/login.php', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password: password.trim() }),
                credentials: 'include' // Important to include cookies
            });
    
            const data = await response.json();
            console.log("Login Response:", data);

            if (response.ok && data.success) {
                // Update authentication state
                await checkAuthStatus();
                console.log("Redirecting to the homepage...");
                navigate('/');
            } else {
                setError(data.message || "Invalid credentials.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LayoutDefault>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
                <Typography variant="h4">Login</Typography>
                
                <TextField 
                    label="Email" 
                    variant="outlined" 
                    sx={{ margin: '10px', width: '300px' }} 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    error={!!error && error.includes('email')}
                    disabled={loading}
                />

                <TextField 
                    label="Password" 
                    type="password" 
                    variant="outlined" 
                    sx={{ margin: '10px', width: '300px' }} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    error={!!error && error.includes('password')}
                    disabled={loading}
                />

                {error && <Alert severity="error" sx={{ mt: 1, width: '300px' }}>{error}</Alert>}

                <Link href="./#/forgot-password" sx={{ marginBottom: '10px', cursor: 'pointer' }}>
                    Forgot Password?
                </Link>

                <Button 
                    variant="contained" 
                    sx={{ marginTop: '10px' }} 
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        Don't have an account?{' '}
                        <Link href="./#/register" sx={{ cursor: 'pointer' }}>
                            Register here
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </LayoutDefault>
    );
}

export default LoginPage;