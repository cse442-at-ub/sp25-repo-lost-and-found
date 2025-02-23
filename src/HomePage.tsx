import React from 'react'
import LayoutDefault from './LayoutDefault'
import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material'

function HomePage() {
  return (
    <>
        <LayoutDefault>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h4" gutterBottom>
            Lost something? Found something?
            </Typography>
            <Typography variant="h2" gutterBottom>
            Lost and Found Portal
            </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card sx={{ maxWidth: 345 }}>
                    <CardActionArea>
                        <CardMedia
                        component="img"
                        image="/report-lost-item.png"
                        alt="green iguana"
                        />
                        <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Report Lost Item
                        </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
                <Card sx={{ maxWidth: 345 }}>
                    <CardActionArea>
                        <CardMedia
                        component="img"
                        image="/report-lost-item.png"
                        alt="green iguana"
                        />
                        <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Report Found Item
                        </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
                <Card sx={{ maxWidth: 345 }}>
                    <CardActionArea>
                        <CardMedia
                        component="img"
                        image="/report-lost-item.png"
                        alt="green iguana"
                        />
                        <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Claim Item
                        </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Box>
        </LayoutDefault>
    </>
  )
}

export default HomePage