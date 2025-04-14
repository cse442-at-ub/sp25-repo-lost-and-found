import React, { useState } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, TextField, Typography, useMediaQuery } from "@mui/material";
import RocketIcon from '@mui/icons-material/Rocket'; // Replace with your actual image or icon

function RegisterPage() {
  const isMobile = useMediaQuery('(max-width:600px)');

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePasswordRequirements = (password: string) => {
    const isValid = password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*()\-_=]/.test(password);
    setPasswordError(!isValid);
    return isValid;
  };

  const handleRegister = async () => {
    setErrorMessage("");

    if (!firstName || !lastName || !username || !email || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(true);
      setErrorMessage("Please enter a valid email address.");
      return;
    } else setEmailError(false);

    if (!validatePasswordRequirements(password)) {
      setErrorMessage("Password does not meet the requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      setErrorMessage("Passwords do not match.");
      return;
    } else setConfirmPasswordError(false);

    try {
      const response = await fetch("./Backend/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, username, email, password }),
      });

      const data = await response.json();
      if (!data.success) {
        setErrorMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      setErrorMessage("Server error. Please try again.");
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
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Last Name"
            variant="standard"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Username"
            variant="standard"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="E-mail Address"
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            variant="standard"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm Password"
            type="password"
            variant="standard"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPasswordError}
            fullWidth
            sx={{ mb: 2 }}
          />

          {errorMessage && (
            <Typography sx={{ color: 'red', fontSize: '0.9rem', mt: 1, mb: 2 }}>
              {errorMessage}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" onClick={handleRegister}>
              Sign Up
            </Button>
            <Button variant="outlined">Sign In</Button>
          </Box>
        </Box>
      </Box>
    </LayoutDefault>
  );
}

export default RegisterPage;
