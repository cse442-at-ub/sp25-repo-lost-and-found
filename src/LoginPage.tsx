import React, { useState } from 'react';
import { Box, Button, Link, TextField, Typography } from '@mui/material';

import LayoutDefault from './LayoutDefault';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("https://se-prod.cse.buffalo.edu/CSE442/2025-Spring/cse-442s/dinal/Backend/login.php", {
            //const response = await fetch("http://localhost:5173/CSE442/2025-Spring/cse-442s/backend/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password: password.trim() }),
            });
            
    
            const data = await response.json();
            console.log("Login Response:", data); // Debug the response

            if (response.ok && data.success) {
                console.log("Redirecting to the homepage...");
                window.location.href = "/CSE442/2025-Spring/cse-442s/dinal/dist/";
            } else {
                setError(data.message || "Invalid credentials.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Server error. Please try again.");
        }finally {
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
                />

                <TextField 
                    label="Password" 
                    type="password" 
                    variant="outlined" 
                    sx={{ margin: '10px', width: '300px' }} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />

                {error && <Typography color="error">{error}</Typography>}

                <Link href="./#forgot-password" sx={{ marginBottom: '10px', cursor: 'pointer' }}>
                    Forgot Password?
                </Link>

                <Button 
                    variant="contained" 
                    sx={{ marginTop: '10px' }} 
                    onClick={handleLogin} 
                >
                    Login
                </Button>
            </Box>
        </LayoutDefault>
    );
}

export default LoginPage;

