import React, { useEffect, useState } from 'react'
import LayoutDefault from './LayoutDefault'
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Grid, Grid2, Typography } from '@mui/material'
import ReportLostItem from '../public/report-lost-item.png'
import ReportFoundItem from '../public/report-found-item.png'
import ClaimItem from '../public/claim-item.png'
import { useNavigate } from 'react-router'

function HomePage() {   
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<any>({});

    useEffect(() => {
        fetch('https://se-prod.cse.buffalo.edu/CSE442/2025-Spring/cse-442s/userinfo.php', {
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
                
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Typography variant="h4" gutterBottom>
                    Lost something? Found something?
                    </Typography>
                    <Typography variant="h2" gutterBottom>
                    Lost and Found Portal
                    </Typography>
                </Box>

                <Grid container justifyContent={'center'} spacing={12}>
                    <Grid item size={4}>
                        <Card sx={{ maxWidth: 345 }}>
                            <CardActionArea>
                                <CardMedia
                                component="img"
                                image={ReportLostItem}
                                alt="green iguana"
                                />
                                <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Report Lost Item
                                </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                    <Grid item size={4}>
                        <Card sx={{ maxWidth: 345 }}>
                            <CardActionArea>
                                <CardMedia
                                component="img"
                                image={ReportFoundItem}
                                alt="green iguana"
                                />
                                <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Report Found Item
                                </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                    <Grid item size={4}>
                        <Card sx={{ maxWidth: 345 }}>
                            <CardActionArea>
                                <CardMedia
                                component="img"
                                image={ClaimItem}
                                alt="green iguana"
                                />
                                <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Claim Item
                                </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                </Grid>

                <Grid2 container columns={{ xs: 4, sm: 8, md: 12 }} marginTop={'auto'} backgroundColor={'black'} padding={'15px'}>
                    <Grid2 item size={4} color={"grey"}>
                        <Typography variant="h4" gutterBottom>
                        About
                        </Typography>
                        <Typography variant="body" gutterBottom>
                        We connect people with their lost belongings through a simple and efficient platform. Report lost or found items, browse listings, and get reunited with what matters.
                        </Typography>
                    </Grid2>
                </Grid2>
        </LayoutDefault>
    </>
  )
}

export default HomePage
