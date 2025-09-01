import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import type { TelegramContact } from '../../types/telegram.types';
import { api } from '../../services/api';

export const ContactsList: React.FC = () => {
  const [contacts, setContacts] = useState<TelegramContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get('/telegram/contacts');
        setContacts(response.data.contacts || []);
      } catch (err: any) {
        setError('Failed to fetch contacts');
        console.error('Contacts fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Your Telegram Contacts
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <strong>Demo Data:</strong> Due to Telegram's privacy policies, direct contact 
        access requires additional API setup and user permissions. The contacts shown 
        below are mock data for demonstration purposes.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {contacts.length === 0 ? (
        <Typography color="text.secondary">
          No contacts available.
        </Typography>
      ) : (
        <List>
          {contacts.map((contact) => (
            <ListItem key={contact.id} divider>
              <ListItemAvatar>
                <Avatar src={contact.photo_url}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">
                      {contact.first_name} {contact.last_name}
                    </Typography>
                    {contact.username && (
                      <Chip 
                        label={`@${contact.username}`} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    {contact.phone_number && (
                      <Typography variant="body2" color="text.secondary">
                        📞 {contact.phone_number}
                      </Typography>
                    )}
                    {contact.note && (
                      <Typography variant="caption" color="warning.main">
                        {contact.note}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};