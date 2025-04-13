import React, { useState } from 'react';
import { Box, Button, Link, TextField, Typography, CircularProgress, Alert, Checkbox, FormControlLabel } from '@mui/material';
import LayoutDefault from './LayoutDefault';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [agree, setAgree] = useState(false);
    const navigate = useNavigate();
    const { checkAuthStatus } = useAuth();

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
                credentials: 'include'
            });

            const data = await response.json();
            console.log("Login Response:", data);

            if (response.ok && data.success) {
                await checkAuthStatus();
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!error && error.toLowerCase().includes('email')}
                        disabled={loading}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        variant="standard"
                        fullWidth
                        sx={{ mb: 2, maxWidth: 400 }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!error && error.toLowerCase().includes('password')}
                        disabled={loading}
                    />

                    {error && <Alert severity="error" sx={{ width: '100%', maxWidth: 400, mb: 2 }}>{error}</Alert>}

                    <FormControlLabel
                        control={<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />}
                        label={
                            <Typography variant="body2">
                                By Signing In, I Agree with <Link href="#">Terms & Conditions</Link>
                            </Typography>
                        }
                        sx={{ maxWidth: 400, mb: 2 }}
                    />

                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ maxWidth: 400, mb: 2, py: 1.2 }}
                        onClick={handleLogin}
                        disabled={loading || !agree}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Don’t have an account? <Link href="./#/register">Register here</Link>
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
