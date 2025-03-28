import React, { useEffect, useState } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

function ClaimPage() {
    const navigate = useNavigate();
    const [foundItems, setFoundItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFoundItems = async () => {
            try {
                const response = await fetch('https://se-prod.cse.buffalo.edu/CSE442/2025-Spring/cse-442s/Backend/claimuser.php', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch items');
                }
                
                const data = await response.json();
                if (data.status === 'success') {
                    setFoundItems(data.items);
                } else {
                    setError(data.error || 'Unknown error occurred');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchFoundItems();
    }, []);

    const handleClaimItem = async (itemId: number) => {
        try {
            // In a real app, you would get the userId from authentication context
            const response = await fetch('https://se-prod.cse.buffalo.edu/CSE442/2025-Spring/cse-442s/Backend/claimuser.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId: itemId,
                    userId: 1, // Replace with actual user ID from auth
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to claim item');
            }
            
            const data = await response.json();
            if (data.status === 'success') {
                alert('Item claimed successfully!');
                // Refresh the items list
                setFoundItems(prevItems => prevItems.filter(item => item.item_id !== itemId));
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to claim item');
        }
    };

    if (loading) {
        return (
            <LayoutDefault>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Typography variant="h6">Loading items...</Typography>
                </Box>
            </LayoutDefault>
        );
    }

    if (error) {
        return (
            <LayoutDefault>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Typography variant="h6" color="error">{error}</Typography>
                </Box>
            </LayoutDefault>
        );
    }

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
                {foundItems.map((item) => (
                    <Grid item key={item.item_id} xs={12} sm={6} md={4}>
                        <Card sx={{ maxWidth: 345, textAlign: 'center', padding: 2 }}>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    {item.item_name}
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    <strong>Found at:</strong> {item.location_found}
                                </Typography>
                                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                                    {item.description}
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    sx={{ mt: 2 }}
                                    onClick={() => handleClaimItem(item.item_id)}
                                >
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
