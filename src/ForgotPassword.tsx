import { useState } from "react";
import { Button, TextField, Box, Container, Card, CardContent, Typography } from "@mui/material";
import LayoutDefault from "./LayoutDefault";
import { Link, useNavigate } from "react-router";

const ForgotPassword = (e: any) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('./Backend/src/sendOtp.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      const j = await response.json();
      console.log(j);
      if (j.okay) {
        navigate('/reset-password', {state: {email: email}});
      } else {
        setErrMsg(j.msg);
        console.error(errMsg);
      }
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
                  name="email" autoComplete="email" autoFocus type="email"
                  onChange={(e) => { setEmail(e.target.value); }}
                  sx={{m: 1}}/>
              <Typography hidden={errMsg.length===0} sx={{color: "#cc0000"}}>{errMsg}</Typography>
              <Button fullWidth variant="contained" type="submit"
                  disabled={email.length === 0}
                  sx={{m: 1}}>Reset Password</Button>
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
