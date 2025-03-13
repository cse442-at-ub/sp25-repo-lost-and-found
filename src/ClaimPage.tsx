import React, { useEffect, useState } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

function ClaimPage() {
    const navigate = useNavigate();
    const [claimedItems, setClaimedItems] = useState<any[]>([]);

    // Placeholder for future backend integration
    useEffect(() => {
        // Fetch claimable items once backend is set up
        setClaimedItems([
            { id: 1, name: 'Black Wallet', description: 'Item was found in Capen Third Floor booth' },
            { id: 2, name: 'Silver Water Bottle', description: 'Item was found in Governors Dining Hall' },
        ]);
    }, []);

    return (
        <LayoutDefault>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                <Typography variant="h2" gutterBottom>
                    Claim an Item
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Browse lost items and claim what belongs to you.
                </Typography>
            </Box>

            <Grid container justifyContent={'center'} spacing={4} sx={{ mt: 3 }}>
                {claimedItems.map((item) => (
                    <Grid item key={item.id} xs={12} sm={6} md={4}>
                        <Card sx={{ maxWidth: 345, textAlign: 'center', padding: 2 }}>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    {item.name}
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    {item.description}
                                </Typography>
                                <Button variant="contained" sx={{ mt: 2 }}>
                                    Claim Item
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </LayoutDefault>
    );
}

export default ClaimPage;