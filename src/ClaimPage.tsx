import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  Typography, 
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  AppBar,
  Toolbar,
  Badge,
  Chip,
  Avatar,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import LayoutDefault from './LayoutDefault';
import { useNavigate } from 'react-router';
import { useAuth } from './components/AuthContext';

interface FoundItem {
  id: number;
  item_name: string;
  location_found: string;
  description: string;
  image?: string;
  date_found?: string;
  category?: string;
}

interface ClaimData {
  itemId: number;
  proofOfOwnership: string;
  additionalDetails: string;
}

interface Message {
  message_id: number;
  user_id: number;
  user_name: string;
  message: string;
  created_at: string;
}

interface ChatResponse {
  success: boolean;
  conversation_id: number;
  status: string;
  messages: Message[];
}

interface ActiveConversation {
  item_id: number;
  initiating_user_id: number;
  initiating_user_name: string;
  last_message_timestamp: string;
  is_waiting: boolean;
}

function ClaimPage() {
  const fadeIn = {
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    }
  };

  const bounce = {
    '@keyframes bounce': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)' },
    }
  };

  const pulse = {
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.1)' },
      '100%': { transform: 'scale(1)' },
    }
  };

  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, userId, loading: authLoading } = useAuth();
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [activeConversations, setActiveConversations] = useState<ActiveConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null);
  const [claimData, setClaimData] = useState<ClaimData>({
    itemId: 0,
    proofOfOwnership: '',
    additionalDetails: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'error' | 'warning' | 'info' | 'success'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversationStatus, setConversationStatus] = useState<string>('open');
  const [isInitialFetch, setIsInitialFetch] = useState(true); // Track if it's the first fetch

  useEffect(() => {
    console.log('Auth state on mount:', { isAuthenticated, isAdmin, userId, authLoading });
  }, []);

  const filteredItems = foundItems.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location_found.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to view and claim items',
        severity: 'warning'
      });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchFoundItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('./Backend/getFoundItems.php', {
          method: 'GET',
          credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        if (data.success) {
          setFoundItems(data.items || []);
        } else {
          setError(data.message || 'Failed to fetch items');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFoundItems();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchActiveConversations = async () => {
      try {
        const response = await fetch('./Backend/activeConversations.php', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          setActiveConversations(data.conversations || []);
        }
      } catch (err) {
        console.error('Error fetching active conversations:', err);
      }
    };

    if (foundItems.length > 0) {
      fetchActiveConversations();
      const intervalId = setInterval(() => {
        fetchActiveConversations();
      }, 10000);
      return () => clearInterval(intervalId);
    }
  }, [foundItems]);

  const handleSelectItem = (item: FoundItem) => {
    setSelectedItem(item);
    setClaimData({
      itemId: item.id,
      proofOfOwnership: '',
      additionalDetails: ''
    });
    setMessages([]);
    setNewMessage('');
    setConversationId(null);
    setConversationStatus('open');
    setError('');
    setIsInitialFetch(true); // Reset for new item
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClaimData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return selectedItem !== null && claimData.proofOfOwnership.trim().length >= 10;
  };

  const handleSubmitClaim = async () => {
    if (!isAuthenticated) {
      setSnackbar({ open: true, message: 'Please log in to submit a claim', severity: 'error' });
      navigate('/login');
      return;
    }
    if (!isFormValid()) {
      setSnackbar({ open: true, message: 'Please provide necessary details', severity: 'error' });
      return;
    }
    try {
      const response = await fetch('./Backend/submitClaims.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: claimData.itemId,
          claim_type: 'found',
          proof_of_ownership: claimData.proofOfOwnership,
          additional_details: claimData.additionalDetails
        }),
        credentials: 'include'
      });
      const data = await response.json();
      setSnackbar({
        open: true,
        message: data.success ? 'Claim submitted successfully' : (data.message || 'Failed to submit claim'),
        severity: data.success ? 'success' : 'error'
      });
      if (data.success) {
        setSelectedItem(null);
        setClaimData({ itemId: 0, proofOfOwnership: '', additionalDetails: '' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error submitting claim', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchMessages = async () => {
    if (!selectedItem || !isAuthenticated) return;
    try {
      // Only show loading spinner for the initial fetch
      if (isInitialFetch) {
        setChatLoading(true);
      }
      const response = await fetch(
        `./Backend/chat.php?item_id=${selectedItem.id}&item_type=found`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data: ChatResponse = await response.json();
      if (data.success) {
        setConversationId(data.conversation_id);
        setConversationStatus(data.status);
        // Only update messages if they are different
        setMessages((prevMessages) => {
          const newMessages = data.messages || [];
          const isDifferent = JSON.stringify(prevMessages) !== JSON.stringify(newMessages);
          return isDifferent ? newMessages : prevMessages;
        });
        setError('');
        setIsInitialFetch(false);
      } else {
        setError(data.error || 'Failed to load messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading messages');
      console.error('Fetch messages error:', err);
    } finally {
      if (isInitialFetch) {
        setChatLoading(false);
      }
    }
  };

  useEffect(() => {
    if (selectedItem && isAuthenticated) {
      fetchMessages();
      const intervalId = setInterval(() => {
        fetchMessages();
      }, 10000); // Changed from 2000ms to 10000ms (10 seconds)
      return () => clearInterval(intervalId);
    } else {
      setMessages([]);
      setNewMessage('');
      setConversationId(null);
      setConversationStatus('open');
      setError('');
      setIsInitialFetch(true);
    }
  }, [selectedItem, isAuthenticated]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !selectedItem) {
      setError('Cannot send message: Missing message or conversation ID');
      console.log('Send message blocked:', { newMessage, conversationId, selectedItem });
      return;
    }
    if (conversationStatus === 'closed') {
      setError('Cannot send message: This conversation is closed');
      return;
    }
    try {
      setChatLoading(true);
      setError('');
      console.log('Sending message:', { conversation_id: conversationId, message: newMessage });
      const response = await fetch('./Backend/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, message: newMessage }),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      if (data.success) {
        console.log('Message sent successfully:', data);
        await fetchMessages();
        setNewMessage('');
        setSnackbar({ open: true, message: 'Message sent successfully', severity: 'success' });
      } else {
        setError(data.error || 'Failed to send message');
        console.error('Send message failed:', data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending message');
      console.error('Send message error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!isAdmin) {
      setError('Unauthorized: Admin access required');
      return;
    }
    if (!messageId) {
      setError('Cannot delete: Message ID is missing');
      return;
    }
    try {
      setChatLoading(true);
      console.log('Deleting message with ID:', messageId);
      const response = await fetch('./Backend/deleteMessage.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      if (data.success) {
        await fetchMessages();
        setSnackbar({ open: true, message: 'Message deleted successfully', severity: 'success' });
      } else {
        setError(data.error || 'Failed to delete message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting message');
      console.error('Delete message error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCloseConversation = async () => {
    if (!isAdmin) {
      setError('Unauthorized: Admin access required');
      return;
    }
    if (!conversationId) {
      setError('Cannot close conversation: Missing conversation ID');
      return;
    }
    try {
      setChatLoading(true);
      console.log('Closing conversation with ID:', conversationId);
      const response = await fetch('./Backend/closeConversation.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId }),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'Conversation closed successfully', severity: 'success' });
        const activeResponse = await fetch('./Backend/activeConversations.php', {
          method: 'GET',
          credentials: 'include',
        });
        const activeData = await activeResponse.json();
        if (activeData.success) {
          setActiveConversations(activeData.conversations || []);
        } else {
          console.error('Failed to refresh active conversations:', activeData);
        }
        setConversationStatus('closed');
        setSelectedItem(null);
      } else {
        setError(data.error || 'Failed to close conversation');
      }
    } catch (err) {
      if (err.message.includes('HTTP error 404')) {
        setError('Conversation endpoint not found. Please ensure closeConversation.php is deployed on the server.');
      } else {
        setError(err instanceof Error ? err.message : 'Error closing conversation');
      }
      console.error('Close conversation error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <LayoutDefault>
        <Paper sx={{ padding: 4, maxWidth: 600, margin: 'auto', marginTop: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Typography variant="h5" align="center" gutterBottom>
            Authentication Required
          </Typography>
          <Alert severity="warning" sx={{ mb: 3 }}>
            You need to be logged in to view and claim items.
          </Alert>
          <Box display="flex" justifyContent="center">
            <Button variant="contained" color="primary" onClick={() => navigate('/login')} size="large">
              Go to Login
            </Button>
          </Box>
        </Paper>
      </LayoutDefault>
    );
  }

  if (loading) {
    return (
      <LayoutDefault>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading items...</Typography>
        </Box>
      </LayoutDefault>
    );
  }

  if (error && !selectedItem) {
    return (
      <LayoutDefault>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <Typography variant="h6">{error}</Typography>
            <Typography>Please try again later.</Typography>
          </Alert>
        </Box>
      </LayoutDefault>
    );
  }

  return (
    <LayoutDefault>
      <AppBar position="static" color="transparent" elevation="0">
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <IconButton color="primary" onClick={() => navigate('/claim')} title="Go to Claim Item Page">
            <HomeIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 3, animation: 'fadeIn 0.5s ease-out' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Claim an Item
          </Typography>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Browse found items and claim what belongs to you
          </Typography>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search items by name, location, or description..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover fieldset': { borderColor: '#1976d2' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

        {filteredItems.length === 0 && !selectedItem && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            No items match your search criteria.
          </Alert>
        )}

        {selectedItem ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', ...fadeIn, animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid #eee', color: '#1976d2' }}>
                  Selected Item
                </Typography>
                <Box sx={{ mb: 2, textAlign: 'center', mt: 3 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={selectedItem.image ? `${selectedItem.image}` : './public/no-image.png'}
                    alt={selectedItem.item_name}
                    sx={{ objectFit: 'contain', mb: 2, borderRadius: 1, bgcolor: '#f5f5f5', p: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                  />
                </Box>
                <Typography variant="h6" sx={{ color: '#333' }}>{selectedItem.item_name}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Found at:</strong> {selectedItem.location_found}
                </Typography>
                {selectedItem.date_found && (
                  <Typography variant="body1" color="text.secondary">
                    <strong>Date Found:</strong> {selectedItem.date_found}
                  </Typography>
                )}
                {selectedItem.category && (
                  <Typography variant="body1" color="text.secondary">
                    <strong>Category:</strong> {selectedItem.category}
                  </Typography>
                )}
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Description:</strong> {selectedItem.description}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                  }}
                  onClick={() => setSelectedItem(null)}
                >
                  Select Different Item
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', ...fadeIn, animation: 'fadeIn 0.5s ease-out forwards', animationDelay: '0.2s', opacity: 0 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, pb: 1, borderBottom: '1px solid #eee', color: '#1976d2' }}>
                  Submit Claim
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 2, fontStyle: 'italic' }}>
                  Please provide details to verify your ownership of this item.
                </Typography>
                <TextField
                  fullWidth
                  required
                  label="Proof of Ownership"
                  name="proofOfOwnership"
                  value={claimData.proofOfOwnership}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  placeholder="Describe specific details about the item that only the owner would know (serial number, distinctive marks, contents, etc.)"
                  error={claimData.proofOfOwnership.trim().length > 0 && claimData.proofOfOwnership.trim().length < 10}
                  helperText={claimData.proofOfOwnership.trim().length > 0 && claimData.proofOfOwnership.trim().length < 10 ? "Please provide at least 10 characters" : ""}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      '&:hover fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Additional Details (Optional)"
                  name="additionalDetails"
                  value={claimData.additionalDetails}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  placeholder="Any additional information that might help verify your claim"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      '&:hover fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={!isFormValid()}
                  onClick={handleSubmitClaim}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 2,
                    bgcolor: '#1976d2',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s',
                    '&:hover': { boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)', transform: 'translateY(-2px)', bgcolor: '#1565c0' },
                    '&:active': { boxShadow: '0 2px 8px rgba(25, 118, 210, 0.4)', transform: 'translateY(1px)' },
                    '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.12)', boxShadow: 'none' }
                  }}
                >
                  SUBMIT CLAIM
                </Button>
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: '#1976d2' }}>
                      {isAdmin && conversationId && activeConversations.find(conv => conv.item_id === selectedItem.id)
                        ? `Chatting with ${activeConversations.find(conv => conv.item_id === selectedItem.id)?.initiating_user_name}`
                        : 'Chat about this item'}
                    </Typography>
                    {isAdmin && messages.length > 0 && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<CloseIcon />}
                        onClick={handleCloseConversation}
                        disabled={chatLoading}
                        sx={{
                          borderRadius: 2,
                          animation: 'bounce 1s infinite',
                          ...bounce,
                          '&:hover': { bgcolor: '#ffebee' },
                        }}
                      >
                        Close Chat
                      </Button>
                    )}
                  </Box>
                  {chatLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <CircularProgress size={24} />
                      <Typography sx={{ ml: 1 }}>Loading chat...</Typography>
                    </Box>
                  )}
                  {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                      {error}
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => setError('')}
                        sx={{ ml: 1 }}
                      >
                        Dismiss
                      </Button>
                    </Alert>
                  )}
                  {conversationStatus === 'closed' && !error && (
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                      This conversation is closed. You cannot send new messages.
                      {!isAdmin && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          For further assistance, please contact us at <strong>support@example.com</strong> or call <strong>+1-800-555-1234</strong>.
                        </Typography>
                      )}
                    </Alert>
                  )}
                  {!chatLoading && messages.length === 0 && !error && (
                    <Typography color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                      No messages yet. Start the conversation!
                    </Typography>
                  )}
                  <Paper elevation={3} sx={{ height: 300, overflow: 'auto', marginBottom: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <List>
                      {messages.map((message) => {
                        const isSender = String(message.user_id) === String(userId);
                        return (
                          <React.Fragment key={message.message_id}>
                            <ListItem
                              sx={{
                                display: 'flex',
                                justifyContent: isSender ? 'flex-end' : 'flex-start',
                                px: 2,
                                py: 1,
                                animation: 'fadeIn 0.3s ease-out',
                                ...fadeIn,
                              }}
                              secondaryAction={
                                isAdmin && !isSender ? (
                                  <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleDeleteMessage(message.message_id)}
                                    disabled={chatLoading}
                                    sx={{ color: '#ef5350' }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                ) : null
                              }
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-end', maxWidth: '70%' }}>
                                {!isSender && (
                                  <Avatar
                                    sx={{ bgcolor: '#1976d2', mr: 1, width: 32, height: 32, fontSize: '0.9rem' }}
                                  >
                                    {message.user_name.charAt(0)}
                                  </Avatar>
                                )}
                                <Box
                                  sx={{
                                    bgcolor: isSender
                                      ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                                      : 'linear-gradient(135deg, #e0e0e0 0%, #d5d5d5 100%)',
                                    color: isSender ? 'white' : 'black',
                                    borderRadius: 2,
                                    p: 1.5,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  }}
                                >
                                  <Typography variant="body2" fontWeight="bold">
                                    {message.user_name}
                                  </Typography>
                                  <Typography variant="body2">
                                    {message.message}
                                  </Typography>
                                  <Typography variant="caption" display="block" sx={{ opacity: 0.7, mt: 0.5 }}>
                                    {new Date(message.created_at).toLocaleString()}
                                  </Typography>
                                  {isSender && (
                                    <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
                                      Delivered
                                    </Typography>
                                  )}
                                </Box>
                                {isSender && (
                                  <Avatar
                                    sx={{ bgcolor: '#1976d2', ml: 1, width: 32, height: 32, fontSize: '0.9rem' }}
                                  >
                                    {message.user_name.charAt(0)}
                                  </Avatar>
                                )}
                              </Box>
                            </ListItem>
                          </React.Fragment>
                        );
                      })}
                    </List>
                  </Paper>
                  <Box sx={{ display: 'flex', gap: 1, p: 1, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={conversationStatus === 'closed'}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white',
                          '&:hover fieldset': { borderColor: '#1976d2' },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || chatLoading || conversationStatus === 'closed'}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                        '&:hover': { boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)', bgcolor: '#1565c0' },
                      }}
                    >
                      <SendIcon />
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3} sx={{ minHeight: '300px', justifyContent: filteredItems.length === 0 ? 'center' : 'flex-start' }}>
            {filteredItems.map((item) => {
              const conversation = activeConversations.find(conv => conv.item_id === item.id);
              const isActive = !!conversation;
              const isWaiting = isActive && conversation.is_waiting;

              return (
                <Grid item key={item.id} xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      width: '100%',
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      },
                      border: isActive ? '2px solid #1976d2' : 'none',
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.image ? `${item.image}` : './public/no-image.png'}
                      alt={item.item_name}
                      sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5', padding: 2 }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
                        {item.item_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Found at:</strong> {item.location_found}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.description && item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                      </Typography>
                      {isActive && (
                        <>
                          <Chip
                            icon={<ChatIcon />}
                            label="Active Chat"
                            color="primary"
                            size="small"
                            sx={{ mb: 1, bgcolor: '#1976d2', color: 'white' }}
                          />
                          {isAdmin && (
                            <Typography variant="body2" color={isWaiting ? "error.main" : "text.secondary"} sx={{ mb: 1 }}>
                              <strong>Chat Initiated By:</strong> {conversation.initiating_user_name}
                              {isWaiting && (
                                <Badge
                                  badgeContent={<ChatIcon sx={{ fontSize: 12 }} />}
                                  color="error"
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                  sx={{
                                    ml: 1,
                                    animation: 'pulse 1.5s infinite',
                                    ...pulse,
                                  }}
                                >
                                  <Typography component="span" variant="caption" color="error.main">
                                    Waiting for Response
                                  </Typography>
                                </Badge>
                              )}
                              {conversation.last_message_timestamp && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Last message: {new Date(conversation.last_message_timestamp).toLocaleString()}
                                </Typography>
                              )}
                            </Typography>
                          )}
                        </>
                      )}
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleSelectItem(item)}
                        sx={{
                          mt: 2,
                          borderRadius: 2,
                          bgcolor: '#1976d2',
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                          '&:hover': { bgcolor: '#1565c0', boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)' },
                        }}
                      >
                        Claim This Item
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LayoutDefault>
  );
}

export default ClaimPage;