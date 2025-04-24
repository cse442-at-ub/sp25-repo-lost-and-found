import React, { useEffect, useState } from 'react';
import LayoutDefault from './LayoutDefault';
import { 
  Box, 
  Button, 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia, 
  Container,
  Grid, 
  Typography,
  Paper
} from '@mui/material';
import ReportLostItem from '../public/report-lost-item.png';
import ReportFoundItem from '../public/report-found-item.png';
import ClaimItem from '../public/claim-item.png';
import { useNavigate } from 'react-router';

function HomePage() {   
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<any>({});

    useEffect(() => {
        fetch('./Backend/userinfo.php', {
            credentials: 'include',
        })
        .then(response => response.json())
        .then(data => setUserInfo(data))
        .catch(error => console.error('Error fetching user info:', error));
    }, []);

    const actionCards = [
        { 
            title: "Report Lost Item", 
            image: ReportLostItem, 
            action: () => navigate("/report-lost-item"),
            color: '#4caf50', // Green
            iconBg: '#e8f5e9' // Light green
        },
        { 
            title: "Report Found Item", 
            image: ReportFoundItem, 
            action: () => navigate("/report-found-item"),
            color: '#2196f3', // Blue
            iconBg: '#e3f2fd' // Light blue
        },
        { 
            title: "Claim Item", 
            image: ClaimItem, 
            action: () => navigate("/claim"),
            color: '#ff9800', // Orange
            iconBg: '#fff3e0' // Light orange
        }
    ];

    return (
        <LayoutDefault>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* User Info Section - EXACTLY as in original file */}
                <Box sx={{ display: 'flex', justifyContent: 'right', gap: '20px', margin: '20px' }}>
                    { userInfo["user_id"] ?
                        <>
                            <Typography variant="body1" gutterBottom>Welcome, {userInfo['first_name']}</Typography>
                        </>
                    : 
                        <>
                            <Button variant="contained" onClick={() => navigate('/login')}>Login</Button>
                            <Button variant="contained" onClick={() => navigate('/register')}>Register</Button>
                        </>
                    }
                </Box>
                
                {/* Main Heading */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    flexDirection: 'column',
                    mb: 6
                }}>
                    <Typography variant="h4" gutterBottom>
                        Lost something? Found something?
                    </Typography>
                    <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Lost and Found Portal
                    </Typography>
                </Box>

                {/* Action Cards with Larger Images */}
                <Grid container spacing={6} justifyContent={'center'} sx={{ mb: 6 }}>
                    {actionCards.map((item, index) => (
                        <Grid item key={index} xs={12} sm={6} md={4}>
                            <Paper elevation={3} sx={{ 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.3s',
                                border: `2px solid ${item.color}`,
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: 6
                                }
                            }}>
                                <CardActionArea 
                                    onClick={item.action}
                                    sx={{ 
                                        flexGrow: 1,
                                        p: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}
                                >
                                    {/* Larger Image Container */}
                                    <Box sx={{
                                        width: 200,
                                        height: 200,
                                        mb: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <CardMedia
                                            component="img"
                                            image={item.image}
                                            alt={item.title}
                                            sx={{ 
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))'
                                            }}
                                        />
                                    </Box>
                                    <CardContent sx={{ 
                                        textAlign: 'center',
                                        width: '100%',
                                        backgroundColor: item.iconBg,
                                        borderRadius: 1
                                    }}>
                                        <Typography gutterBottom variant="h5" component="div" sx={{
                                            color: item.color,
                                            fontWeight: 'bold'
                                        }}>
                                            {item.title}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Footer Section */}
                <Box sx={{ 
                    backgroundColor: 'primary.dark',
                    color: 'primary.contrastText',
                    p: 3,
                    borderRadius: 1,
                    textAlign: 'center',
                    mt: 4
                }}>
                    <Typography variant="h6" gutterBottom>
                        About
                    </Typography>
                    <Typography variant="body1">
                        We connect people with their lost belongings through a simple and efficient platform. 
                        Report lost or found items, browse listings, and get reunited with what matters.
                    </Typography>
                </Box>
            </Container>
        </LayoutDefault>
    );
}

export default HomePage;