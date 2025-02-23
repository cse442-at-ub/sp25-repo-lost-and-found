import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

function LoginPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <Typography variant="h4">Login</Typography>
      <TextField label="Email" variant="outlined" sx={{ margin: '10px', width: '300px' }} />
      <TextField label="Password" type="password" variant="outlined" sx={{ margin: '10px', width: '300px' }} />
      <Button variant="contained" sx={{ marginTop: '10px' }}>Login</Button>
    </Box>
  );
}

export default LoginPage;
