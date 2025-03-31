import React, { useEffect, useState } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, Card, CardContent, Grid, Typography, TextField } from '@mui/material';
import { useNavigate } from 'react-router';

function ClaimPage() {
    const navigate = useNavigate();
    const [claimedItems, setClaimedItems] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setClaimedItems([
            { id: 1, name: 'Black Wallet', description: 'Item was found in Capen Third Floor booth' },
            { id: 2, name: 'Silver Water Bottle', description: 'Item was found in Governors Dining Hall' },
        ]);
    }, []);

    const filteredItems = claimedItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <LayoutDefault>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                <Typography variant="h2" gutterBottom>
                    Claim an Item
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Browse lost items and claim what belongs to you.
                </Typography>
                <TextField
                    label="Search for an item"
                    variant="outlined"
                    fullWidth
                    sx={{ maxWidth: 400, mt: 2 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Box>

            <Grid container justifyContent={'center'} spacing={4} sx={{ mt: 3 }}>
                {filteredItems.map((item) => (
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