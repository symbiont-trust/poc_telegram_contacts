import type { FC } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Box,
  Alert,
} from '@mui/material';
import { Person } from '@mui/icons-material';

interface Contact {
  id: string;
  name: string;
  phone?: string;
  username?: string;
  avatar?: string;
}

interface ContactsListProps {
  contacts: Contact[];
}

const ContactsList: FC<ContactsListProps> = ({ contacts }) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Your Telegram Contacts
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Note: Due to Telegram's privacy policies, direct contact retrieval is limited. 
        This demo shows mock data. In a real implementation, contacts would need to be 
        shared explicitly by users through bot interactions.
      </Alert>

      <List>
        {contacts.map((contact) => (
          <ListItem key={contact.id} divider>
            <ListItemAvatar>
              <Avatar src={contact.avatar}>
                <Person />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={contact.name}
              secondary={
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {contact.username && (
                    <Chip label={`@${contact.username}`} size="small" variant="outlined" />
                  )}
                  {contact.phone && (
                    <Chip label={contact.phone} size="small" variant="outlined" />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {contacts.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No contacts found. In a real implementation, users would need to share
          contacts explicitly through bot interactions.
        </Typography>
      )}
    </Paper>
  );
};

export default ContactsList;