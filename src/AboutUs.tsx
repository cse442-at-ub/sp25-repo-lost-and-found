import React, { useEffect, useState } from 'react'
import LayoutDefault from './LayoutDefault'
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Grid2 as Grid, Typography } from '@mui/material'
import ReportLostItem from '../public/report-lost-item.png'
import ReportFoundItem from '../public/report-found-item.png'
import ClaimItem from '../public/claim-item.png'
import { useNavigate } from 'react-router'

function AboutUs() {   
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<any>({});

    useEffect(() => {
        fetch('./Backend/userinfo.php', {
            credentials: 'include', // Ensures cookies/session are sent with the request
        })
        .then(response => response.json())
        .then(data => setUserInfo(data))
        .catch(error => console.error('Error fetching user info:', error));
    }, []);

    console.log(userInfo)
    if(userInfo['error']) {
        console.log("Not logged in")
    } else {
        console.log(userInfo)
    }

  return (
    <>
        <LayoutDefault>
                <Box sx={{ paddingTop: 4, paddingBottom: 4 }}>
                    <Grid container spacing={4} alignItems="center" justifyContent="center">
                        <Grid item xs={12} md={6}>
                            <Box
                                component="img"
                                src="./logo.png"
                                alt="Hero Image"
                                sx={{ maxWidth: "auto", height: "auto" , objectFit: "contain", display: "block",}}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6} width="500px">
                            <Typography variant="h3" component="h1">
                                Get To Know About Lost and Found Portal
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                            Welcome to Lost and Found Portal! We are a lost and found portal that helps you find lost items like your phone, keys, wallet, or any other valuable items. You can also report your found items here and we will try to connect you with the owner.
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                
                <Box sx={{ paddingTop: 4, paddingBottom: 4 }}>
                    <Grid container spacing={4} alignItems="center" justifyContent="space-between" alignContent="normal" marginLeft={5} marginRight={5}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h3" component="h1">
                                How It Works
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                            How It Works
                            Follow these steps to recover your lost items effectively
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6} width="500px">
                            <Box
                                component="img"
                                src="./example-items.png"
                                alt="Hero Image"
                                
                                sx={{ maxWidth: "320px", height: "auto" , objectFit: "contain", display: "block",}}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ paddingTop: 4 }}>
                    <Grid container spacing={4} alignItems="center" justifyContent="space-between" marginLeft={5} marginRight={5} textAlign="center">
                        <Grid item size={{xs: 12, md:3}} flexDirection="column" justifyItems="center">
                            <Box
                                    component="img"
                                    src="./search-icon.png"
                                    alt="Hero Image"
                                    height="70px"
                                    sx={{ borderRadius: 2 }}
                                />
                            <Typography variant="h4" component="h1">
                                Identify the Item
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Locate your lost or found item using our search feature.
                            </Typography>
                        </Grid>

                        <Grid item size={{xs: 12, md:3}} flexDirection="column" justifyItems="center">
                            <Box
                                    component="img"
                                    src="./report-icon.png"
                                    alt="Hero Image"
                                    height="70px"
                                    sx={{ borderRadius: 2 }}
                                />
                            <Typography variant="h4" component="h1">
                                Report the Item
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                            Report your lost or found item to us.
                            </Typography>
                        </Grid>
                        
                        <Grid item size={{xs: 12, md:3}} flexDirection="column" justifyItems="center">
                            <Box
                                    component="img"
                                    src="./claim-icon.png"
                                    alt="Hero Image"
                                    height="70px"
                                    sx={{ borderRadius: 2 }}
                                />
                            <Typography variant="h4" component="h1">
                                Claim the Item
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                            Retrieve your lost item after verification of details.
                            </Typography>
                        </Grid>

                        <Grid item size={{xs: 12, md:3}} flexDirection="column" justifyItems="center">
                            <Box
                                    component="img"
                                    src="./reunite-icon.png"
                                    alt="Hero Image"
                                    height="70px"
                                    sx={{ borderRadius: 2 }}
                                />
                            <Typography variant="h4" component="h1">
                                Reunite & Enjoy
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                            Get back your item and enjoy peace of mind.
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
        </LayoutDefault>
    </>
  )
}

export default AboutUs
