import { useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramAuthProps {
  onAuth: (user: TelegramUser) => void;
  loading: boolean;
}

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: TelegramUser) => void;
    };
  }
}

const TelegramAuth = ({ onAuth, loading }: TelegramAuthProps) => {
  useEffect(() => {
    // Set up Telegram login callback
    window.TelegramLoginWidget = {
      dataOnauth: (user: TelegramUser) => {
        onAuth(user);
      },
    };

    // Load Telegram login widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', import.meta.env.VITE_TELEGRAM_BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    const container = document.getElementById('telegram-login-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container && container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, [onAuth]);

  return (
    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Telegram Contacts POC
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Sign in with your Telegram account to access your contacts.
        This POC supports both users with and without 2FA enabled.
      </Typography>
      <Box id="telegram-login-container" sx={{ display: 'flex', justifyContent: 'center' }} />
      {loading && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Authenticating...
        </Typography>
      )}
    </Paper>
  );
};

export default TelegramAuth;