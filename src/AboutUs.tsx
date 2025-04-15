import React, { useEffect, useState } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router';

function AboutUs() {
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
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(to bottom, #0d47a1, #1976d2)',
                    color: 'white',
                    py: 8,
                    px: 3,
                    fontFamily: 'Roboto, sans-serif',
                }}
            >
                <Grid container spacing={4} alignItems="center" justifyContent="center">
                    <Grid item xs={12} md={6}>
                        <Box
                            component="img"
                            src="./lost-and-found.png"
                            alt="Hero Image"
                            sx={{
                                maxWidth: "350px",
                                height: "auto",
                                objectFit: "contain",
                                display: "block",
                                mx: 'auto'
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                            Get To Know About Lost and Found Portal
                        </Typography>
                        <Typography variant="body1" color="white" sx={{ maxWidth: 500 }}>
                            Welcome to Lost and Found Portal! We help you find lost items like your phone, keys, wallet, or other valuables. You can also report found items here and we'll connect you with the rightful owner.
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* How It Works Section (Side-by-Side) */}
            <Box sx={{ backgroundColor: 'white', py: 8, px: 3 }}>
                <Grid
                    container
                    spacing={4}
                    alignItems="center"
                    justifyContent="center"
                    textAlign="left"
                    sx={{ maxWidth: 1200, mx: 'auto' }}
                >
                    {/* Text */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                            <Typography variant="h3" fontWeight="bold" gutterBottom>
                                How It Works
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Follow these steps to recover your lost items effectively.
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Image */}
                    <Grid item xs={12} md={6}>
                        <Box
                            component="img"
                            src="./example-items.png"
                            alt="How it works"
                            sx={{
                                maxWidth: '100%',
                                height: 'auto',
                                objectFit: 'contain',
                                display: 'block',
                                mx: { xs: 'auto', md: 0 }
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Steps Section (Vertical Layout with Gradient Background) */}
            <Box
                sx={{
                    background: 'linear-gradient(to bottom, #0d47a1, #1976d2)',
                    py: 6,
                    px: 3,
                    color: 'white',
                }}
            >
                <Grid container direction="column" spacing={6} alignItems="center" textAlign="center">
                    {[
                        {
                            title: 'Identify the Item',
                            text: 'Locate your lost or found item using our search feature.',
                            image: './search-icon.png',
                        },
                        {
                            title: 'Report the Item',
                            text: 'Report your lost or found item to us.',
                            image: './report-icon.png',
                        },
                        {
                            title: 'Claim the Item',
                            text: 'Retrieve your lost item after verification of details.',
                            image: './claim-icon.png',
                        },
                        {
                            title: 'Reunite & Enjoy',
                            text: 'Get back your item and enjoy peace of mind.',
                            image: './reunite-icon.png',
                        },
                    ].map((item, index) => (
                        <Grid item key={index}>
                            <Box
                                component="img"
                                src={item.image}
                                alt={item.title}
                                sx={{
                                    height: '70px',
                                    mb: 2,
                                    borderRadius: 2,
                                }}
                            />
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                {item.title}
                            </Typography>
                            <Typography variant="body2" sx={{ maxWidth: 400, color: 'white' }}>
                                {item.text}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </LayoutDefault>
    );
}

export default AboutUs;
