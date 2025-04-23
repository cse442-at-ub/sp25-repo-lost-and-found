import React from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, TextField, Typography, useMediaQuery, Alert } from "@mui/material";
import RocketIcon from '@mui/icons-material/Rocket';
import { Formik, Form, Field, FormikErrors } from 'formik';
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

const initialValues = {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
};

type FormValues = typeof initialValues & {
    server?: string;
};

function RegisterPage() {
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleSubmit = async (values: FormValues, { setSubmitting, setErrors }: any) => {
    try {
      const response = await fetch("./Backend/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setErrors({ server: data.message || "Registration failed." });
      }
    } catch (error) {
      setErrors({ server: "Server error. Please try again." });
    } finally {
      setSubmitting(false);
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
          <Box component="img" src="./logo.png" alt="Logo" sx={{ width: "auto", height: "auto", mb: 1 }} />
          <Typography align="center" mt={2} maxWidth="300px">
            Welcome to Lost & Found Portal! Sign up to get started.
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

          <Formik<FormValues>
            initialValues={initialValues}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
            validateOnBlur
            validateOnChange
          >
            {({ errors, touched, isSubmitting, isValid, dirty }) => (
              <Form>
                <Field
                  as={TextField}
                  name="firstName"
                  label="First Name"
                  variant="standard"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={touched.firstName && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  disabled={isSubmitting}
                />
                <Field
                  as={TextField}
                  name="lastName"
                  label="Last Name"
                  variant="standard"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  disabled={isSubmitting}
                />
                <Field
                  as={TextField}
                  name="username"
                  label="Username"
                  variant="standard"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={touched.username && Boolean(errors.username)}
                  helperText={touched.username && errors.username}
                  disabled={isSubmitting}
                />
                <Field
                  as={TextField}
                  name="email"
                  label="E-mail Address"
                  variant="standard"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  disabled={isSubmitting}
                />
                <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  type="password"
                  variant="standard"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  disabled={isSubmitting}
                />
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Password must be at least 8 characters long and include:
                  <ul style={{ marginTop: 4, marginBottom: 4, paddingLeft: 20 }}>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character (!@#$%^&*()-_=)</li>
                  </ul>
                </Typography>
                <Field
                  as={TextField}
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  variant="standard"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  disabled={isSubmitting}
                />

                {errors.server && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.server}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button 
                    type="submit"
                    variant="contained"
                    disabled={!isValid || !dirty || isSubmitting}
                  >
                    {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                  </Button>
                  <Button variant="outlined" disabled={isSubmitting}>Sign In</Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Box>
    </LayoutDefault>
  );
}

export default RegisterPage;
