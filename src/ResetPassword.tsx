import { useState, useEffect } from "react";
import { Checkbox, List, ListItem, Button, TextField, Box, Container, Card, CardContent, Typography, Paper, Divider } from "@mui/material";
import { styled } from '@mui/material/styles';
import LayoutDefault from "./LayoutDefault";
import { useLocation } from "react-router";
import LockResetIcon from '@mui/icons-material/LockReset';

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
  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  maxWidth: 600,
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

const PasswordRuleItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 0),
  display: 'flex',
  alignItems: 'center',
  '& .MuiCheckbox-root': {
    padding: theme.spacing(0.5),
  },
}));

const ResetPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resp, setResp] = useState({ okay: false, msg: null });

  // Log background image loading
  useEffect(() => {
    const img = new Image();
    img.src = '/julia/Backend/uploads/blue-abstract-background-vector.jpg'; // Absolute path for testing
    img.onload = () => console.log('Background image loaded successfully');
    img.onerror = () => console.error('Failed to load background image');
  }, []);

  const passwdRules = [
    { text: "At least 8 characters", cond: (s: string) => s.length >= 8 },
    { text: "Contains lowercase letter", cond: (s: string) => /[a-z]/.test(s) },
    { text: "Contains uppercase letter", cond: (s: string) => /[A-Z]/.test(s) },
    { text: "Contains number", cond: (s: string) => /[0-9]/.test(s) },
    { text: "Contains special character (!@#$%^&()-_=)", cond: (s: string) => /[!@#$%^&()\-_=]/.test(s) },
    { text: "No invalid characters", cond: (s: string) => !/[^a-zA-Z0-9!@#$%^&()\-_=]/.test(s) },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('./Backend/resetPassword.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          password,
        }),
      });
      const j = await response.json();
      setResp(j);
    } catch (error) {
      console.error('Error during password reset:', error);
      setResp({ okay: false, msg: "An error occurred" });
    }
  };

  return (
    <GlobalStyles>
      <LayoutDefault>
        <StyledContainer maxWidth={false}>
          <Box sx={{ display: "flex", justifyContent: "center", minHeight: "100vh", alignItems: "center" }}>
            <StyledCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LockResetIcon sx={{ fontSize: 40, mr: 2, color: '#1976d2' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    Reset Your Password
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3, color: 'rgba(0, 0, 0, 0.7)' }}>
                  Enter your email, OTP, and new password to reset your account access.
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                    variant="outlined"
                  />
                  <StyledTextField
                    fullWidth
                    required
                    id="otp"
                    label="OTP Token"
                    name="otp"
                    autoComplete="off"
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    error={!/^\d{6}$/.test(otp) && otp.length > 0}
                    helperText={otp.length > 0 && !/^\d{6}$/.test(otp) ? "OTP must be 6 digits" : ""}
                    sx={{ mb: 2 }}
                    variant="outlined"
                  />
                  <StyledTextField
                    fullWidth
                    required
                    id="password"
                    label="New Password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={password.length > 0 && !passwdRules.every((rule) => rule.cond(password))}
                    helperText={password.length > 0 && !passwdRules.every((rule) => rule.cond(password)) ? "Password does not meet requirements" : ""}
                    sx={{ mb: 2 }}
                    variant="outlined"
                  />
                  <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: 'rgba(0, 0, 0, 0.7)' }}>
                      Password Requirements:
                    </Typography>
                    <List dense>
                      {passwdRules.map((rule, index) => (
                        <PasswordRuleItem key={index}>
                          <Checkbox
                            disabled
                            checked={password.length > 0 && rule.cond(password)}
                            sx={{ color: password.length > 0 && rule.cond(password) ? 'success.main' : 'text.secondary' }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: password.length > 0 && rule.cond(password) ? 'success.main' : 'text.secondary' }}
                          >
                            {rule.text}
                          </Typography>
                        </PasswordRuleItem>
                      ))}
                    </List>
                  </Paper>
                  <StyledTextField
                    fullWidth
                    required
                    id="confirm"
                    label="Confirm Password"
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    error={confirm.length > 0 && confirm !== password}
                    helperText={confirm.length > 0 && confirm !== password ? "Passwords do not match" : ""}
                    sx={{ mb: 2 }}
                    variant="outlined"
                  />
                  {resp.msg && (
                    <Typography sx={{ color: resp.okay ? 'success.main' : '#d32f2f', mb: 2, textAlign: 'center' }}>
                      {resp.msg}
                    </Typography>
                  )}
                  <StyledButton
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={
                      !passwdRules.every((rule) => rule.cond(password)) ||
                      confirm !== password ||
                      !/^\d{6}$/.test(otp) ||
                      !email
                    }
                    sx={{ mt: 1 }}
                  >
                    Set New Password
                  </StyledButton>
                </Box>
              </CardContent>
            </StyledCard>
          </Box>
        </StyledContainer>
      </LayoutDefault>
    </GlobalStyles>
  );
};

export default ResetPassword;