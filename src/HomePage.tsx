import React, { useEffect, useState } from 'react';
import LayoutDefault from './LayoutDefault';
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Grid,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import ReportLostItem from '../public/report-lost-item.png';
import ReportFoundItem from '../public/report-found-item.png';
import ClaimItem from '../public/claim-item.png';
import { useNavigate } from 'react-router';

function HomePage() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<any>({});
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        fetch('./Backend/userinfo.php', {
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => setUserInfo(data))
            .catch(error => console.error('Error fetching user info:', error));
    }, []);

    return (
        <LayoutDefault>
            <Box
                sx={{
                    background: 'linear-gradient(to bottom, #0d47a1, #1976d2)',
                    color: 'white',
                    py: 6,
                    px: 3,
                    fontFamily: 'Roboto, sans-serif',
                    minHeight: '100vh',
                }}
            >
                {/* Top Right Buttons */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        mb: 4
                    }}
                >
                    {userInfo["user_id"] ? (
                        <Typography variant="body1" sx={{ fontWeight: '500' }}>
                            Welcome, {userInfo['first_name']}
                        </Typography>
                    ) : (
                        <>
                            <Button variant="contained" color="secondary" onClick={() => navigate('/login')}>
                                Login
                            </Button>
                            <Button variant="contained" color="secondary" onClick={() => navigate('/register')}>
                                Register
                            </Button>
                        </>
                    )}
                </Box>

                {/* Title Section */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h4" gutterBottom>
                        Lost something? Found something?
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
                        Lost and Found Portal
                    </Typography>
                </Box>

                {/* Action Cards */}
                <Grid container spacing={4} justifyContent="center" alignItems="stretch" sx={{ mb: 6 }}>
                    {[
                        {
                            label: 'Report Lost Item',
                            image: ReportLostItem,
                            path: '/report-lost-item'
                        },
                        {
                            label: 'Report Found Item',
                            image: ReportFoundItem,
                            path: '/report-found-item'
                        },
                        {
                            label: 'Claim Item',
                            image: ClaimItem,
                            path: '/claim'
                        }
                    ].map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                                sx={{
                                    maxWidth: 345,
                                    margin: '0 auto',
                                    boxShadow: 6,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.03)' }
                                }}
                            >
                                <CardActionArea onClick={() => navigate(item.path)}>
                                    <CardMedia
                                        component="img"
                                        image={item.image}
                                        alt={item.label}
                                        sx={{ height: 200, objectFit: 'cover' }}
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="div">
                                            {item.label}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* About Footer */}
                <Box sx={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 2, p: 4, textAlign: 'center', color: 'white' }}>
                    <Typography variant="h4" gutterBottom>
                        About
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', color: 'lightgray' }}>
                        We connect people with their lost belongings through a simple and efficient platform.
                        Report lost or found items, browse listings, and get reunited with what matters.
                    </Typography>
                </Box>
            </Box>
        </LayoutDefault>
    );
}

export default HomePage;
