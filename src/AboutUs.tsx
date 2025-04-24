import React, { useEffect, useState } from 'react';
import LayoutDefault from './LayoutDefault';
import { 
  Box, 
  Typography, 
  Grid,
  Paper,
  Container,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router';

function AboutUs() {   
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<any>({});
    const theme = useTheme();

    useEffect(() => {
        fetch('./Backend/userinfo.php', {
            credentials: 'include',
        })
        .then(response => response.json())
        .then(data => setUserInfo(data))
        .catch(error => console.error('Error fetching user info:', error));
    }, []);

    const featureItems = [
        { 
            img: "./search-icon.png", 
            title: "Identify the Item", 
            text: "Locate your lost or found item using our search feature.",
            color: '#4caf50', // Green
            iconBg: '#F8F9FA' // Light green
        },
        { 
            img: "./report-icon.png", 
            title: "Report the Item", 
            text: "Report your lost or found item to us.",
            color: '#2196f3', // Blue
            iconBg: '#F8F9FA' // Light blue
        },
        { 
            img: "./claim-icon.png", 
            title: "Claim the Item", 
            text: "Retrieve your lost item after verification of details.",
            color: '#ff9800', // Orange
            iconBg: '#F8F9FA' // Light orange
        },
        { 
            img: "./reunite-icon.png", 
            title: "Reunite & Enjoy", 
            text: "Get back your item and enjoy peace of mind.",
            color: '#9c27b0', // Purple
            iconBg: '#F8F9FA' // Light purple
        }
    ];

    return (
        <LayoutDefault>
            <Container maxWidth="lg" sx={{ py: 6 }}>
                {/* Hero Section */}
                <Paper elevation={0} sx={{ 
                    p: 6,
                    mb: 6,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #4caf50, #2196f3, #ff9800, #9c27b0)'
                    }
                }}>
                    <Box sx={{ 
                        width: 200,
                        height: 200,
                        mx: 'auto',
                        mb: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        boxShadow: 1
                    }}>
                        <Box
                            component="img"
                            src="./logo.png"
                            alt="Logo"
                            sx={{ 
                                width: '140px',
                                height: 'auto'
                            }}
                        />
                    </Box>
                    
                    <Typography 
                        variant="h3" 
                        gutterBottom
                        sx={{ 
                            color: "#1976d2",
                            fontWeight: 700,
                            mb: 3,
                            position: 'relative',
                            display: 'inline-block',
                            '&:after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '80px',
                                height: '4px',
                                backgroundColor: 'primary.main',
                                borderRadius: 2
                            }
                        }}
                    >
                        Get To Know About Lost and Found Portal
                    </Typography>
                    
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            maxWidth: '800px',
                            mx: 'auto',
                            color: 'text.secondary',
                            lineHeight: 1.6
                        }}
                    >
                        Welcome to Lost and Found Portal! We are a lost and found portal that helps you find lost items like your phone, keys, wallet, or any other valuable items. You can also report your found items here and we will try to connect you with the owner.
                    </Typography>
                </Paper>

                {/* How It Works Section */}
                <Paper elevation={0} sx={{ 
                    p: 6,
                    mb: 6,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography 
                                variant="h4" 
                                fontWeight={700} 
                                gutterBottom
                                sx={{
                                    position: 'relative',
                                    pb: 2,
                                    '&:after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        width: '60px',
                                        height: '4px',
                                        backgroundColor: 'primary.main',
                                        borderRadius: 2
                                    }
                                }}
                            >
                                How It Works
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                                Follow these steps to recover your lost items effectively
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box
                                component="img"
                                src="./example-items.png"
                                alt="Example Items"
                                sx={{ 
                                    width: '100%',
                                    maxWidth: '400px',
                                    height: 'auto',
                                    borderRadius: 2,
                                    boxShadow: 3,
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'scale(1.02)'
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {/* Features Section */}
                <Paper elevation={0} sx={{ 
                    p: 6,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2
                }}>
                    <Typography 
                        variant="h4" 
                        fontWeight={700} 
                        gutterBottom 
                        sx={{ 
                            mb: 6,
                            textAlign: 'center',
                            position: 'relative',
                            '&:after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '80px',
                                height: '4px',
                                backgroundColor: 'primary.main',
                                borderRadius: 2
                            }
                        }}
                    >
                        Our Process
                    </Typography>
                    
                    <Grid container spacing={4}>
                        {featureItems.map((item, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Box sx={{
                                    p: 4,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: 3
                                    }
                                }}>
                                    <Box sx={{
                                        width: 100,
                                        height: 100,
                                        mb: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: item.iconBg,
                                        borderRadius: '50%',
                                        border: `3px solid ${item.color}`,
                                        transition: 'transform 0.3s',
                                        '&:hover': {
                                            transform: 'scale(1.1)'
                                        }
                                    }}>
                                        <Box
                                            component="img"
                                            src={item.img}
                                            alt={item.title}
                                            sx={{ 
                                                height: '70px',
                                                width: '70px',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </Box>
                                    <Typography 
                                        variant="h5" 
                                        fontWeight={600} 
                                        gutterBottom 
                                        sx={{ 
                                            color: item.color,
                                            mb: 2
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {item.text}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Container>
        </LayoutDefault>
    );
}

export default AboutUs;