import React from 'react';
import LayoutDefault from './LayoutDefault';
import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

function RegisterPage() {
  // State variables for input values and error handling
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<boolean>(false);

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
  };

  // Function to handle password input change
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    validatePasswordRequirements(newPassword);
    setConfirmPasswordError(newPassword !== confirmPassword);
  };

  // Function to handle confirm password input change
  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = event.target.value;
    setConfirmPassword(newConfirmPassword);
    setConfirmPasswordError(password !== newConfirmPassword);
  };

  return (
    <>
      <LayoutDefault>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
          <Typography variant="h4">Register</Typography>
          <TextField label="Username" variant="outlined" sx={{ margin: '10px', width: '300px' }} />
          <TextField label="Email" variant="outlined" sx={{ margin: '10px', width: '300px' }} />
          
          {/* Password Field */}
          <TextField 
            label="Password" 
            type="password" 
            variant="outlined" 
            sx={{ margin: '10px', width: '300px' }} 
            value={password}
            onChange={handlePasswordChange}
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
            onChange={handleConfirmPasswordChange}
            error={confirmPasswordError} 
          />
          {confirmPasswordError && (
            <Typography sx={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
              The passwords should match
            </Typography>
          )}

          {/* Password Requirements */}
          <Box sx={{ textAlign: 'left', width: '300px', marginTop: '10px' }}>
            <Typography variant="subtitle1">Password must meet the following requirements:</Typography>
            <ul style={{ paddingLeft: '20px' }}>
              <li><Typography variant="body2">The length of the password is at least 8 letters</Typography></li>
              <li><Typography variant="body2">The password contains at least 1 lowercase letter</Typography></li>
              <li><Typography variant="body2">The password contains at least 1 uppercase letter</Typography></li>
              <li><Typography variant="body2">The password contains at least 1 number</Typography></li>
              <li>
                <Typography variant="body2">
                  The password can contain alphanumeric characters as well as the following special characters: 
                  <strong>{'! , @ , # , $ , % , ^ , & , ( , ) , - , _ , ='}</strong>
                </Typography>
              </li>
              <li><Typography variant="body2">The password contains at least 1 of the 12 special characters listed above</Typography></li>
              <li><Typography variant="body2">The password does not contain any invalid characters (e.g., any character that is not an alphanumeric or one of the 12 special characters)</Typography></li>
            </ul>
          </Box>

          <Button variant="contained" sx={{ marginTop: '10px' }}>Sign Up</Button>
        </Box>
      </LayoutDefault>
    </>
  );
}

export default RegisterPage;
