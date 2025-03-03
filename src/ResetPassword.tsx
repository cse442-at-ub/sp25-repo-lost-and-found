import { useState } from "react";
import { Checkbox, List, ListItem, Button, TextField, Box, Container, Card, CardContent, Typography } from "@mui/material";
import LayoutDefault from "./LayoutDefault";
import { useLocation } from "react-router";

const ResetPassword = (e: any) => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state.email);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resp, setResp] = useState({okay: false, msg: null});
  const passwdRules = [
    {text: "The length of the password is at least 8",
     cond: (s: string) => s.length >= 8},
    {text: "The password contains at least 1 lowercase letter",
     cond: (s: string) => /[a-z]/.test(s)},
    {text: "The password contains at least 1 uppercase letter",
     cond: (s: string) => /[A-Z]/.test(s)},
    {text: "The password contains at least 1 number",
     cond: (s: string) => /[0-9]/.test(s)},
    {text: "The password contains at least 1 of the 12 special characters {'!', '@', '#', '$', '%', '^', '&', '(', ')', '-', '_', '='}",
     cond: (s: string) => /[!@#$%^&()\-_=]/.test(s)},
    {text: "The password does not contain any invalid characters (e.g. any character that is not an alphanumeric or one of the 12 special characters)",
     cond: (s: string) => ! /[^a-zA-Z0-9!@#$%^&()\-_=]/.test(s)}
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('../../julia/backend/src/resetPassword.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
          password: password
        }),
      });
      const j = await response.json();
      console.log(j);
      setResp(j);
    } catch (error) {
      console.error('Error during email query:', error);
    }
  };

  return (
    <LayoutDefault>
    <Container>
      <Box sx={{display: "flex", flexDirection: "column",
          alignItems: "center"}}>
        <Card sx={{marginTop: 20}}>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit} sx={{m: 3}}>
              <TextField fullWidth required id="email" label="Email Address"
                  name="email" autoComplete="email"
                  defaultValue={email}
                  onChange={(e) => {setEmail(e.target.value);}}
                  sx={{m: 1}}/>
              <TextField fullWidth required id="otp" label="OTP Token"
                  name="otp" autoComplete="otp" autoFocus
                  onChange={(e) => {setOtp(e.target.value);}}
                  error={ ! /\d{6}/.test(otp) }
                  helperText="OTP token is 6 digits"
                  sx={{m: 1}}/>
              <TextField fullWidth required id="password" label="Password"
                  name="password" autoComplete="password" type="password"
                  onChange={(e) => {setPassword(e.target.value);}}
                  error={!passwdRules.every((rule) => rule.cond(password))}
                  helperText="Password too weak"
                  sx={{m: 1}}/>
              <List sx={{maxWidth: 600}}>
                {passwdRules.map((rule) =>
                  <ListItem sx={{m:0, padding:0}}>
                    <Checkbox disabled checked={rule.cond(password)}/>
                    {rule.text}
                  </ListItem>
                 )}
              </List>
              <TextField fullWidth required id="confirm" label="Confirm Password"
                  name="confirm" autoComplete="confirm" type="password"
                  onChange={(e) => {setConfirm(e.target.value);}}
                  error={confirm !== password}
                  sx={{m: 1}}/>
              <Typography hidden={resp.msg===null} sx={{color: resp.okay?"#000000":"#cc0000"}}>{resp.msg || ""}</Typography>
              <Button fullWidth variant="contained" type="submit"
                  disabled={!passwdRules.every((rule) => rule.cond(password)) || confirm !== password || ! /\d{6}/.test(otp)}
                  sx={{m: 1}}>Set Password</Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
    </LayoutDefault>
  );
};

export default ResetPassword;
