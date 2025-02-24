import { useState, React } from "react";
import { Button, TextField, Box, Container, Card, CardContent } from "@mui/material";

const ForgotPassword = (e) => {
  const [email, setEmail] = useState("");
  return (
    <Container>
      <Box sx={{display: "flex", flexDirection: "column",
          alignItems: "center"}}>
        <Card sx={{marginTop: 20}}>
          <CardContent>
            <Box component="form" sx={{m: 3}}>
              <TextField fullWidth required id="email" label="Email Address"
                  name="email" autoComplete="email" autoFocus type="email"
                  onChange={(e) => { setEmail(e.target.value); }}
                  sx={{m: 1}}/>
              <Button fullWidth variant="contained" type="submit"
                  disabled={email.length === 0}
                  sx={{m: 1}}>Send OTP</Button>
              <Button fullWidth sx={{m: 1}}>Return to Login</Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
