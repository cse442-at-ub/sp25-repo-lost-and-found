import React, { useState } from 'react';
import LayoutDefault from './LayoutDefault';
import { Box, Button, Card, CardContent, CardMedia, Grid, TextField, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router';

function ItemPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams();
    const itemId = searchParams.get("itemId")

    if(itemId == null) {
        navigate("/claim")
    }

  const [messages, setMessages] = useState([
    { user: 'Laura', text: 'Hey, I found an iPhone near Capen.' },
    { user: 'Emily', text: 'Oh, that might be mine! What color is it?' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      setMessages([...messages, { user: 'You', text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <LayoutDefault>
      <Grid container spacing={3} style={{ padding: 20 }}>
        {/* Lost Item Card */}
        <Grid item xs={12} md={6} alignSelf={'center'}>
          <Card>
            <CardMedia>
              <img src="./admin-claim-item-example.png" alt="Item" />
            </CardMedia>
            <CardContent>
              <Typography variant="h6">iPhone Pro 11</Typography>
              <Typography variant="body2">Found by Laura</Typography>
              <Typography variant="body2">
                iPhone Pro 11 that was found in Capen sitting near a bench
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* General Chat Section */}
        <Grid item xs={12} md={6} alignSelf={'center'}>
          <Card>
            <CardContent>
              <Typography variant="h6">Chat</Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ccc', padding: 2, marginBottom: 2 }}>
                {messages.map((msg, index) => (
                  <Typography key={index} variant="body2">
                    <strong>{msg.user}:</strong> {msg.text}
                  </Typography>
                ))}
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                label="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                style={{ marginTop: 10 }}
              >
                Send
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </LayoutDefault>
  );
}

export default ItemPage;