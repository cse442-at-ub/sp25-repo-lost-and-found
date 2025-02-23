import { useState } from "react";
import { Checkbox, List, ListItem, Button, TextField, Box, Container, Card, CardContent } from "@mui/material";
import LayoutDefault from "./LayoutDefault";

const ResetPassword = (e) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const passwdRules = [
    {text: "The length of the password is at least 8",
     cond: (s) => s.length >= 8},
    {text: "The password contains at least 1 lowercase letter",
     cond: (s) => /[a-z]/.test(s)},
    {text: "The password contains at least 1 uppercase letter",
     cond: (s) => /[A-Z]/.test(s)},
    {text: "The password contains at least 1 number",
     cond: (s) => /[0-9]/.test(s)},
    {text: "The password contains at least 1 of the 12 special characters {'!', '@', '#', '$', '%', '^', '&', '(', ')', '-', '_', '='}",
     cond: (s) => /[!@#$%^&()\-_=]/.test(s)},
    {text: "The password does not contain any invalid characters (e.g. any character that is not an alphanumeric or one of the 12 special characters)",
     cond: (s) => ! /[^a-zA-Z0-9!@#$%^&()\-_=]/.test(s)}
  ];
  return (
    <LayoutDefault>
    <Container>
      <Box sx={{display: "flex", flexDirection: "column",
          alignItems: "center"}}>
        <Card sx={{marginTop: 20}}>
          <CardContent>
            <Box component="form" sx={{m: 3}}>
              <TextField fullWidth required id="email" label="Email Address"
                  name="email" autoComplete="email" autoFocus
                  sx={{m: 1}}/>
              <TextField fullWidth required id="otp" label="OTP Token"
                  name="otp" autoComplete="otp"
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
              <Button fullWidth variant="contained" type="submit"
                  disabled={!passwdRules.every((rule) => rule.cond(password)) || confirm !== password}
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
