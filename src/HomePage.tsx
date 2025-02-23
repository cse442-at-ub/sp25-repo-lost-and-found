import React from 'react'
import LayoutDefault from './LayoutDefault'
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Grid, Grid2, Typography } from '@mui/material'
import ReportLostItem from '../public/report-lost-item.png'
import ReportFoundItem from '../public/report-found-item.png'
import ClaimItem from '../public/claim-item.png'

function HomePage() {
  return (
    <>
        <LayoutDefault>
                <Box sx={{ display: 'flex', justifyContent: 'right', gap: '20px', margin: '20px' }}>
                    <Button variant="contained" onClick={() => navigate('/login')}>Login</Button>
                    <Button variant="contained">Register</Button>
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
                    <Grid2 item size={4}>
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
