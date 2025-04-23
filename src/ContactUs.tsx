import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Tooltip,
  GlobalStyles,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Email, Phone, Schedule } from "@mui/icons-material";
import LayoutDefault from "./LayoutDefault";
import { useNavigate } from "react-router-dom";
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

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundImage: "url('./Backend/uploads/blue-abstract-background-vector.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  position: "relative",
  overflow: "hidden",
  margin: 0,
  padding: 0,
  maxWidth: "none !important",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
    pointerEvents: "none",
  },
}));

const globalStyles = (
  <GlobalStyles
    styles={{
      "@keyframes fadeIn": {
        from: { opacity: 0, transform: "translateY(20px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      "@keyframes pulse": {
        "0%, 100%": { transform: "scale(1)" },
        "50%": { transform: "scale(1.05)" },
      },
      "@keyframes bounce": {
        "0%, 100%": { transform: "translateY(0)" },
        "50%": { transform: "translateY(-5px)" },
      },
      ".fade-in": { animation: "fadeIn 0.6s ease-out" },
      ".fade-in-delay-1": { animation: "fadeIn 0.8s ease-out" },
      ".fade-in-delay-2": { animation: "fadeIn 1s ease-out" },
      ".pulse": { animation: "pulse 1.5s infinite" },
      ".error-bounce": { animation: "bounce 0.3s" },
      body: {
        margin: 0,
        padding: 0,
        overflowX: "hidden",
      },
      html: {
        margin: 0,
        padding: 0,
      },
    }}
  />
);

const ContactUs = () => {
  const [resp, setResp] = useState<{ okay: boolean; msg: string | null }>({ okay: false, msg: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    trigger,
    watch,
  } = useForm<ContactFormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      name: "",
      email: "",
      message: "",
    },
  });

  const messageLength = watch("message").length;
  const validFields = Object.keys(watch()).filter(
    (key) => !errors[key as keyof ContactFormData] && watch(key as keyof ContactFormData)
  ).length;

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("./Backend/contactUs.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const j = await response.json();
      setResp(j);
      if (j.okay) {
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (error) {
      console.error("Error during posting message:", error);
      setResp({ okay: false, msg: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlur = async (fieldName: keyof ContactFormData) => {
    await trigger(fieldName);
  };

  useEffect(() => {
    if (resp.msg) {
      const timer = setTimeout(() => setResp({ okay: false, msg: null }), 5000);
      return () => clearTimeout(timer);
    }
  }, [resp]);

  return (
    <LayoutDefault sx={{ margin: 0, padding: 0, width: "100%" }}>
      {globalStyles}
      <StyledContainer disableGutters>
        <Box sx={{ 
          backgroundColor: "rgba(255, 255, 255, 0.95)", 
          py: 8, 
          textAlign: "center", 
          width: "100%",
          margin: 0,
          paddingLeft: 0,
          paddingRight: 0,
        }}>
          <Container maxWidth="xl" sx={{ margin: 0, padding: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: "bold", mb: 2, color: "primary.main" }}
              className="fade-in"
            >
              Let's Connect
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, fontWeight: "medium", color: "primary.main", opacity: 0.9 }}
              className="fade-in-delay-1"
            >
              Have a question or idea? Reach out to us today!
            </Typography>
          </Container>
        </Box>
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: 8,
            margin: 0,
            paddingLeft: { xs: 2, sm: 3, md: 4 },
            paddingRight: { xs: 2, sm: 3, md: 4 },
            width: "100%",
          }}
        >
          <Grid
            container
            direction={{ xs: "column-reverse", md: "row-reverse" }}
            spacing={{ xs: 3, md: 4 }}
            sx={{ maxWidth: 1400, mx: "auto" }}
          >
            <Grid size={{ xs: 12, md: 5 }}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  borderRadius: 3,
                  position: { md: "sticky" },
                  top: 20,
                }}
                className="fade-in-delay-2"
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}
                  >
                    Contact Info
                  </Typography>
                  <List>
                    <Tooltip title="Call us">
                      <ListItem
                        sx={{
                          "&:hover": { backgroundColor: "rgba(25,118,210,0.1)", borderRadius: 2 },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <ListItemIcon>
                          <Phone
                            sx={{
                              fontSize: 36,
                              color: "primary.main",
                              "&:hover": { transform: "scale(1.1)" },
                              transition: "transform 0.2s",
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="1 (716) 234-5678"
                          slotProps={{ primary: { fontSize: "1.2rem", fontWeight: "medium", color: "primary.main" } }}
                        />
                      </ListItem>
                    </Tooltip>
                    <Tooltip title="Email us">
                      <ListItem
                        sx={{
                          "&:hover": { backgroundColor: "rgba(25,118,210,0.1)", borderRadius: 2 },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <ListItemIcon>
                          <Email
                            sx={{
                              fontSize: 36,
                              color: "primary.main",
                              "&:hover": { transform: "scale(1.1)" },
                              transition: "transform 0.2s",
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="lostandfound@email.com"
                          slotProps={{ primary: { fontSize: "1.2rem", fontWeight: "medium", color: "primary.main" } }}
                        />
                      </ListItem>
                    </Tooltip>
                    <Tooltip title="Our hours">
                      <ListItem
                        sx={{
                          "&:hover": { backgroundColor: "rgba(25,118,210,0.1)", borderRadius: 2 },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <ListItemIcon>
                          <Schedule
                            sx={{
                              fontSize: 36,
                              color: "primary.main",
                              "&:hover": { transform: "scale(1.1)" },
                              transition: "transform 0.2s",
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Weekdays 9 AM - 4 PM"
                          slotProps={{ primary: { fontSize: "1.2rem", fontWeight: "medium", color: "primary.main" } }}
                        />
                      </ListItem>
                    </Tooltip>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  borderRadius: 3,
                  maxWidth: { xs: "100%", sm: 800 },
                  mx: "auto",
                }}
                className="fade-in-delay-1"
              >
                <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                  <Typography
                    variant="h5"
                    sx={{ mb: 4, fontWeight: "bold", color: "primary.main" }}
                  >
                    Send Us a Message
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: "primary.main" }}>
                      Progress: {validFields}/4 fields completed
                    </Typography>
                    <Box
                      sx={{
                        width: "100%",
                        height: 6,
                        backgroundColor: "#e0e0e0",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(validFields / 4) * 100}%`,
                          height: "100%",
                          backgroundColor: "primary.main",
                          transition: "width 0.3s",
                        }}
                      />
                    </Box>
                  </Box>
                  <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <TextField
                      fullWidth
                      required
                      id="username"
                      label="Username"
                      placeholder="Enter your username"
                      {...register("username")}
                      error={!!errors.username}
                      helperText={errors.username?.message}
                      onBlur={() => handleBlur("username")}
                      InputProps={{ "aria-label": "Username" }}
                      sx={{
                        "& .MuiInputBase-root": { borderRadius: 2, backgroundColor: "#fff" },
                        "& .Mui-focused": { boxShadow: "0 0 0 3px rgba(25,118,210,0.2)" },
                        "& .MuiInputLabel-root": { color: "primary.main" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                      }}
                      className={errors.username ? "error-bounce" : ""}
                    />
                    <TextField
                      fullWidth
                      required
                      id="name"
                      label="Name"
                      placeholder="Enter your full name"
                      {...register("name")}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      onBlur={() => handleBlur("name")}
                      InputProps={{ "aria-label": "Name" }}
                      sx={{
                        "& .MuiInputBase-root": { borderRadius: 2, backgroundColor: "#fff" },
                        "& .Mui-focused": { boxShadow: "0 0 0 3px rgba(25,118,210,0.2)" },
                        "& .MuiInputLabel-root": { color: "primary.main" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                      }}
                      className={errors.name ? "error-bounce" : ""}
                    />
                    <TextField
                      fullWidth
                      required
                      id="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      {...register("email")}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      onBlur={() => handleBlur("email")}
                      InputProps={{ "aria-label": "Email Address" }}
                      sx={{
                        "& .MuiInputBase-root": { borderRadius: 2, backgroundColor: "#fff" },
                        "& .Mui-focused": { boxShadow: "0 0 0 3px rgba(25,118,210,0.2)" },
                        "& .MuiInputLabel-root": { color: "primary.main" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                      }}
                      className={errors.email ? "error-bounce" : ""}
                    />
                    <TextField
                      fullWidth
                      required
                      id="message"
                      label="Message"
                      placeholder="Enter your message"
                      {...register("message")}
                      error={!!errors.message}
                      helperText={
                        <Box>
                          {errors.message?.message}
                          <Typography variant="caption" sx={{ display: "block", mt: 1, color: "primary.main" }}>
                            {messageLength}/10 characters
                          </Typography>
                        </Box>
                      }
                      onBlur={() => handleBlur("message")}
                      multiline
                      minRows={5}
                      InputProps={{ "aria-label": "Message" }}
                      sx={{
                        "& .MuiInputBase-root": { borderRadius: 2, backgroundColor: "#fff" },
                        "& .Mui-focused": { boxShadow: "0 0 0 3px rgba(25,118,210,0.2)" },
                        "& .MuiInputLabel-root": { color: "primary.main" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                      }}
                      className={errors.message ? "error-bounce" : ""}
                    />
                    {resp.msg && (
                      <Alert
                        severity={resp.okay ? "success" : "error"}
                        sx={{
                          borderRadius: 2,
                          backgroundColor: resp.okay ? "rgba(0,200,83,0.1)" : "rgba(211,47,47,0.1)",
                          color: resp.okay ? "primary.main" : "error.main",
                        }}
                        aria-live="polite"
                        className="fade-in"
                      >
                        {resp.msg}
                      </Alert>
                    )}
                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      disabled={!isValid || !isDirty || isSubmitting}
                      sx={{
                        py: 1.8,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #1976d2 0%, #115293 100%)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #115293 0%, #0d3c6e 100%)",
                          transform: "scale(1.03)",
                        },
                        "&:disabled": { background: "#b0bec5" },
                        transition: "transform 0.2s, background 0.2s",
                        textTransform: "none",
                        fontSize: "1.2rem",
                        fontWeight: "medium",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      }}
                      className={isValid && isDirty && !isSubmitting ? "pulse" : ""}
                    >
                      {isSubmitting ? <CircularProgress size={28} color="inherit" /> : "Send Message"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </StyledContainer>
    </LayoutDefault>
  );
};

export default ContactUs;