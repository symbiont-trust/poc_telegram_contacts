import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { TelegramLogin } from '../telegram/TelegramLogin';
import { ContactsList } from '../telegram/ContactsList';
import { TelegramUser } from '../../types/telegram.types';
import { api } from '../../services/api';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTelegramAuth = async (userData: TelegramUser) => {
    try {
      const response = await api.post('/telegram/verify-auth', userData);
      
      if (response.data.success) {
        setTelegramUser(userData);
        setTelegramConnected(true);
        setError(null);
      } else {
        setError('Telegram authentication failed');
      }
    } catch (err: any) {
      setError('Failed to verify Telegram authentication');
      console.error('Telegram auth error:', err);
    }
  };

  const handleDisconnectTelegram = () => {
    setTelegramUser(null);
    setTelegramConnected(false);
    setError(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Your wallet is connected and verified.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Wallet Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Connected Address:
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                {user?.wallet_address}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Account Created:
              </Typography>
              <Typography variant="body1">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Telegram Status
            </Typography>
            {telegramConnected && telegramUser ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Connected as {telegramUser.first_name} {telegramUser.last_name}
                  {telegramUser.username && ` (@${telegramUser.username})`}
                </Alert>
                <Button 
                  variant="outlined" 
                  onClick={handleDisconnectTelegram}
                  size="small"
                >
                  Disconnect Telegram
                </Button>
              </Box>
            ) : (
              <Alert severity="info">
                Connect your Telegram account to access contacts
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {!telegramConnected && (
            <TelegramLogin onAuth={handleTelegramAuth} />
          )}
          
          {telegramConnected && (
            <ContactsList />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};