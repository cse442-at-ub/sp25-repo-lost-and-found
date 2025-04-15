import { useState } from "react";
import { Button, TextField, Box, Container, Card, CardContent, Typography, Divider } from "@mui/material";
import { styled } from '@mui/material/styles';
import LayoutDefault from "./LayoutDefault";
import { Link, useNavigate } from "react-router";
import LockOpenIcon from '@mui/icons-material/LockOpen';

// Add global styles to ensure full viewport coverage
const GlobalStyles = styled('div')({
  html: {
    margin: 0,
    padding: 0,
    height: '100%',
    width: '100%',
  },
  body: {
    margin: 0,
    padding: 0,
    height: '100%',
    width: '100%',
  },
  '#root': {
    height: '100%',
    width: '100%',
  },
});

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  height: '100%',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'url("./Backend/uploads/blue-abstract-background-vector.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
    pointerEvents: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    backgroundSize: 'contain',
    backgroundPosition: 'top center',
  },
  [theme.breakpoints.between('sm', 'md')]: {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(8),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  maxWidth: 500,
  width: '100%',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(5px)',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%',
    marginTop: theme.spacing(4),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5),
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(45deg, #1976d2, #2196f3)',
  color: '#ffffff',
  '&:hover': {
    background: 'linear-gradient(45deg, #1565c0, #1976d2)',
  },
  '&:disabled': {
    background: '#666666',
    color: '#aaaaaa',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 0 8px rgba(0,0,0,0.2)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.7)',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
}));

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrMsg("");
    try {
      const response = await fetch('./Backend/sendOtp.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || `Server error: ${response.status}`);
      }
      const j = await response.json();
      console.log('Response from sendOtp.php:', j);
      if (j.okay) {
        navigate('/reset-password', { state: { email } });
      } else {
        setErrMsg(j.msg || 'Failed to send OTP. Please try again.');
        console.error('Error message from backend:', j.msg);
      }
    } catch (error) {
      console.error('Error during email query:', error);
      setErrMsg(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <GlobalStyles>
      <LayoutDefault>
        <StyledContainer maxWidth={false}> {/* Set maxWidth to false to remove width constraint */}
          <Box sx={{ display: "flex", justifyContent: "center", minHeight: "100vh", alignItems: "center" }}>
            <StyledCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LockOpenIcon sx={{ fontSize: 40, mr: 2, color: '#1976d2' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    Forgot Password
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3, color: 'rgba(0, 0, 0, 0.7)' }}>
                  Enter your email address to receive a one-time password (OTP) to reset your password.
                </Typography>
                <Divider sx={{ mb: 3, backgroundColor: 'rgba(0, 0, 0, 0.2)' }} />
                <Box component="form" onSubmit={handleSubmit}>
                  <StyledTextField
                    fullWidth
                    required
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                    variant="outlined"
                  />
                  {errMsg && (
                    <Typography sx={{ color: '#d32f2f', mb: 2, textAlign: 'center' }}>
                      {errMsg}
                    </Typography>
                  )}
                  <StyledButton
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={email.length === 0}
                    sx={{ mb: 2 }}
                  >
                    Send OTP
                  </StyledButton>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        borderRadius: 8,
                        padding: 1.5,
                        textTransform: 'none',
                        color: '#1976d2',
                        borderColor: '#1976d2',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          borderColor: '#1565c0',
                        },
                      }}
                    >
                      Return to Login
                    </Button>
                  </Link>
                </Box>
              </CardContent>
            </StyledCard>
          </Box>
        </StyledContainer>
      </LayoutDefault>
    </GlobalStyles>
  );
};

export default ForgotPassword;