import { useState } from "react";
import { Button, TextField, Box, Container, Card, CardContent, Typography, Grid2 as Grid, ListItem, List, ListItemIcon, ListItemText } from "@mui/material";
import { Email, Phone, Schedule } from "@mui/icons-material";
import LayoutDefault from "./LayoutDefault";
import { Link, Navigate, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface ContactFormData {
  username: string;
  name: string;
  email: string;
  message: string;
}

const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  message: yup.string().required("Message is required").min(10, "Message must be at least 10 characters"),
});

const ContactUs = () => {
  const [resp, setResp] = useState({okay: false, msg: null});
  const navigate = useNavigate();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid, isDirty, touchedFields },
    trigger
  } = useForm<ContactFormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      name: "",
      email: "",
      message: ""
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch('./Backend/contactUs.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const j = await response.json();
      console.log(j);
      setResp(j);
      if (j.okay) navigate('/');
    } catch (error) {
      console.error('Error during posting message:', error);
    }
  };

  const handleBlur = async (fieldName: keyof ContactFormData) => {
    await trigger(fieldName);
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
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{m: 1}}>
                <TextField 
                  fullWidth 
                  required 
                  id="username" 
                  label="Username"
                  {...register("username")}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  onBlur={() => handleBlur("username")}
                  sx={{m: 1}}
                />
                <TextField 
                  fullWidth 
                  required 
                  id="name" 
                  label="Name"
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  onBlur={() => handleBlur("name")}
                  sx={{m: 1}}
                />
                <TextField 
                  fullWidth 
                  required 
                  id="email" 
                  label="Email Address"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  onBlur={() => handleBlur("email")}
                  sx={{m: 1}}
                />
                <TextField 
                  fullWidth 
                  required 
                  id="message" 
                  label="Message"
                  {...register("message")}
                  error={!!errors.message}
                  helperText={errors.message?.message}
                  onBlur={() => handleBlur("message")}
                  multiline 
                  minRows={5}
                  sx={{m: 1}}
                />
                <Typography hidden={resp.msg===null} sx={{color: resp.okay?"#000000":"#cc0000"}}>{resp.msg || ""}</Typography>
                <Button 
                  fullWidth 
                  variant="contained" 
                  type="submit"
                  disabled={!isValid || !isDirty}
                  sx={{m: 1}}
                >
                  Send
                </Button>
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
