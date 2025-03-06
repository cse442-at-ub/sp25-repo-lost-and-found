import React, { useEffect, useState } from 'react'
import LayoutDefault from './LayoutDefault'
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Container, Grid2 as Grid, Paper, TextField, Typography } from '@mui/material'
import ReportLostItem from '../public/report-lost-item.png'
import ReportFoundItem from '../public/report-found-item.png'
import ClaimItem from '../public/claim-item.png'
import { useNavigate } from 'react-router'

function ContactUs() {   
    const [form, setForm] = useState({ username: "", name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    
    Object.keys(form).forEach((key) => {
      if (!form[key]) newErrors[key] = "This field is required";
    });
    
    if (form.email && !validateEmail(form.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log("Form submitted", form);
    }
  };

  return (
    <>
    <LayoutDefault>
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Contact Us Form
        </Typography>
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            variant="outlined"
            name="username"
            value={form.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            variant="outlined"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            variant="outlined"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Message"
            multiline
            rows={4}
            variant="outlined"
            name="message"
            value={form.message}
            onChange={handleChange}
            error={!!errors.message}
            helperText={errors.message}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
            Submit
          </Button>
        </Box>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body1">1 (716) 234-5678</Typography>
          <Typography variant="body1">lostandfound@email.com</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Weekdays 9 AM - 4 PM <br /> Weekends Closed
          </Typography>
        </Box>
      </Paper>
    </Container>
    </LayoutDefault>
    </>
  );
}

export default ContactUs
