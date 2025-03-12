import { useState } from "react";
import { Button, TextField, Box, Container, Card, CardContent, Typography, Grid2 as Grid, ListItem, List, ListItemIcon, ListItemText } from "@mui/material";
import { Email, Phone, Schedule } from "@mui/icons-material";
import LayoutDefault from "./LayoutDefault";
import { Link, useNavigate } from "react-router";

const ContactUs = (e: any) => {
  // const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resp, setResp] = useState({okay: false, msg: null});

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('../Backend/contactUs.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          name: name,
          email: email,
          message: message
        }),
      });
      const j = await response.json();
      console.log(j);
      setResp(j);
    } catch (error) {
      console.error('Error during posting message:', error);
    }
  };

  return (
    <LayoutDefault>
    <Typography variant="h3" sx={{textAlign: "center", mt: 10}}>Contact Us</Typography>
    <Grid container direction="row-reverse" spacing={1} rowSpacing={5} sx={{marginTop: 5, maxWidth: 800, marginLeft: "auto", marginRight: "auto"}}>
      <Grid size={{xs: 12, md: 4}}>
        <List sx={{marginLeft: "auto", marginRight: "auto", width: "fit-content"}}>
          <ListItem>
            <ListItemIcon><Phone sx={{fontSize: "32pt"}}/></ListItemIcon>
            <ListItemText primary="1 (716) 234-5678" slotProps={{primary: {fontSize: "16pt"}}} />
          </ListItem>
          <ListItem>
            <ListItemIcon><Email sx={{fontSize: "32pt"}}/></ListItemIcon>
            <ListItemText primary="lostandfound@email.com" slotProps={{primary: {fontSize: "16pt"}}} />
          </ListItem>
          <ListItem>
            <ListItemIcon><Schedule sx={{fontSize: "32pt"}}/></ListItemIcon>
            <ListItemText primary="Weekdays 9 AM - 4 PM" slotProps={{primary: {fontSize: "16pt"}}} />
          </ListItem>
        </List>
      </Grid>
      <Grid size={{xs: 12, md: 8}}>
        <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", marginRight: "auto", marginLeft: "auto", maxWidth: 600}}>
          <Card>
            <CardContent>
              <Box component="form" onSubmit={handleSubmit} sx={{m: 1}}>
                <TextField fullWidth required id="username" label="Username"
                    name="username" autoComplete="username" autoFocus type="username"
                    onChange={(e) => { setUsername(e.target.value); }}
                    sx={{m: 1}}/>
                <TextField fullWidth required id="name" label="Name"
                    name="name" autoComplete="name" autoFocus type="name"
                    onChange={(e) => { setName(e.target.value); }}
                    sx={{m: 1}}/>
                <TextField fullWidth required id="email" label="Email Address"
                    name="email" autoComplete="email" autoFocus type="email"
                    onChange={(e) => { setEmail(e.target.value); }}
                    sx={{m: 1}}/>
                <TextField fullWidth required id="message" label="Message"
                    name="message" autoComplete="message" autoFocus type="message"
                    multiline minRows={5}
                    onChange={(e) => { setMessage(e.target.value); }}
                    sx={{m: 1}}/>
                <Typography hidden={resp.msg===null} sx={{color: resp.okay?"#000000":"#cc0000"}}>{resp.msg || ""}</Typography>
                <Button fullWidth variant="contained" type="submit"
                    // onClick={() => { navigate("/reset-password"); }}
                    // disabled={email.length === 0}
                    sx={{m: 1}}>Send</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </Grid>
    </LayoutDefault>
  );
};

export default ContactUs;
