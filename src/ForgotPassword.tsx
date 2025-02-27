import { useState } from "react";
import { Button, TextField, Box, Container, Card, CardContent } from "@mui/material";
import LayoutDefault from "./LayoutDefault";
import { Link, useNavigate } from "react-router";

const ForgotPassword = (e: any) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  return (
    <LayoutDefault>
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
              <Button fullWidth variant="contained"
                  onClick={() => { navigate("/reset-password"); }}
                  disabled={email.length === 0}
                  sx={{m: 1}}>Send OTP</Button>
              <Link to="/login"><Button fullWidth sx={{m: 1}}>Return to Login</Button></Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
    </LayoutDefault>
  );
};

export default ForgotPassword;
