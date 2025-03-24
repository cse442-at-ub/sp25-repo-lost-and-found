import React, { useEffect, useState } from 'react'
import LayoutDefault from './LayoutDefault'
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@mui/material'

function AdminClaim() {   
  return (
    <>
        <LayoutDefault>
        <Grid container spacing={3} style={{ padding: 20 }}>
            {/* Lost Item Card */}
            <Grid item xs={12} md={6} alignSelf={"center"}>
                <Card>
                <CardMedia>
                    <img src="./admin-claim-item-example.png" // Replace with actual image path
                    alt="Item"></img>
                </CardMedia>
                <CardContent>
                    <Typography variant="h6">iPhone Pro 11</Typography>
                    <Typography variant="body2">Found by Laura</Typography>
                    <Typography variant="body2">
                    iPhone Pro 11 that was found in Capen sitting near a bench
                    </Typography>
                    {/* Claim button doesn't make much sense here */}
                    {/* <Button variant="contained" color="primary" style={{ marginRight: 10, marginTop: 10 }}>
                    CLAIM
                    </Button> */}
                </CardContent>
                </Card>
            </Grid>
            
            {/* Claim Card */}
            <Grid item xs={12} md={6} alignSelf={"center"}>
                <Card>
                <CardMedia>
                    <img src="./admin-claim-person-example.png" // Replace with actual image path
                    alt="Claimant"></img>
                </CardMedia>
                <CardContent>
                    <Typography variant="h6">Claim</Typography>
                    <Typography variant="body2">Name: Emily</Typography>
                    <Typography variant="body2">Person #: asdfasdf</Typography>
                    <Button variant="contained" style={{ backgroundColor: "green", color: "white", marginRight: 10, marginTop: 10 }}>
                    APPROVE
                    </Button>
                    <Button variant="contained" style={{ backgroundColor: "red", color: "white", marginTop: 10 }}>
                    DENY
                    </Button>
                </CardContent>
                </Card>
            </Grid>
            </Grid>
        </LayoutDefault>
    </>
  )
}

export default AdminClaim
