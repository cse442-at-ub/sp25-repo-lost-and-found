import React, { useState } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, TextField, Typography } from "@mui/material";

function RegisterPage() {
  // State variables for input values and error handling
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Function to validate password requirements
  const validatePasswordRequirements = (password: string) => {
    const minLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const allowedSpecialChars = /[!@#$%^&*()\-_=]/;
    const hasSpecialChar = allowedSpecialChars.test(password);
    const isValid = minLength && hasLowercase && hasUppercase && hasNumber && hasSpecialChar;

    setPasswordError(!isValid);
    return isValid;
  };

  // Function to handle registration
  const handleRegister = async () => {
    setErrorMessage(""); // Clear previous errors

    if (!email || !password || !username) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (!validatePasswordRequirements(password)) {
      setErrorMessage("Password does not meet requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442s/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("Registration successful");
      } else {
        setErrorMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      setErrorMessage("Server error. Please try again.");
    }
  };

  return (
    <LayoutDefault>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
        <Typography variant="h4">Register</Typography>
        
        <TextField 
          label="Username" 
          variant="outlined" 
          sx={{ margin: '10px', width: '300px' }} 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField 
          label="Email" 
          variant="outlined" 
          sx={{ margin: '10px', width: '300px' }} 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
        />
        
        {/* Password Field */}
        <TextField 
          label="Password" 
          type="password" 
          variant="outlined" 
          sx={{ margin: '10px', width: '300px' }} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError} 
        />
        {passwordError && (
          <Typography sx={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
            The password requirements haven't been met
          </Typography>
        )}

        {/* Confirm Password Field */}
        <TextField 
          label="Confirm Password" 
          type="password" 
          variant="outlined" 
          sx={{ margin: '10px', width: '300px' }} 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPasswordError} 
        />
        {confirmPasswordError && (
          <Typography sx={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
            The passwords should match
          </Typography>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Typography sx={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
            {errorMessage}
          </Typography>
        )}

        <Button variant="contained" sx={{ marginTop: '10px' }} onClick={handleRegister}>
          Sign Up
        </Button>
      </Box>
    </LayoutDefault>
  );
}

export default RegisterPage;
