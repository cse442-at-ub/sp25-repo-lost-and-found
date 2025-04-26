import React, { useEffect, useState } from 'react';
import { Badge, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthContext';

interface Conversation {
    conversation_id: number;
    item_id: number;
    item_name: string;
    last_message_time: string;
}

function ConversationIcon() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchConversations = async () => {
            try {
                setLoading(true);
                const response = await fetch('./Backend/activeConversations.php', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();

                if (data.success) {
                    setConversations(data.conversations || []);
                }
            } catch (err) {
                console.error('Error fetching conversations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
        const interval = setInterval(fetchConversations, 30000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    if (!isAdmin || loading || conversations.length === 0) {
        return null;
    }

    return (
        <IconButton
            color="inherit"
            onClick={() => navigate('/claim')}
        >
            <Badge badgeContent={conversations.length} color="error">
                <ChatIcon />
            </Badge>
        </IconButton>
    );
}

export default ConversationIcon;