import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { TelegramUser } from '../../types/telegram.types';

interface TelegramLoginProps {
  onAuth: (user: TelegramUser) => void;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

export const TelegramLogin: React.FC<TelegramLoginProps> = ({ onAuth }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up callback
    window.onTelegramAuth = onAuth;

    // Note: For the POC, we would need an actual Telegram bot token
    // This would require creating a bot with @BotFather and setting up domain
    
    // Mock implementation for demonstration
    const mockScript = document.createElement('div');
    mockScript.innerHTML = `
      <div style="
        background: #0088cc; 
        color: white; 
        padding: 12px 20px; 
        border-radius: 6px; 
        text-align: center; 
        cursor: pointer; 
        font-family: Arial, sans-serif;
        font-size: 14px;
        display: inline-block;
      " onclick="window.mockTelegramAuth()">
        📱 Log in via Telegram (Mock)
      </div>
    `;

    // Mock auth function for demo
    (window as any).mockTelegramAuth = () => {
      const mockUser: TelegramUser = {
        id: 123456789,
        first_name: 'Demo',
        last_name: 'User',
        username: 'demo_user',
        photo_url: undefined,
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'mock_hash_for_demo'
      };
      onAuth(mockUser);
    };

    if (containerRef.current) {
      containerRef.current.appendChild(mockScript);
    }

    return () => {
      if (containerRef.current && mockScript.parentNode) {
        mockScript.parentNode.removeChild(mockScript);
      }
      delete window.onTelegramAuth;
      delete (window as any).mockTelegramAuth;
    };
  }, [onAuth]);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Connect Your Telegram Account
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Link your Telegram account to access your contacts. This uses Telegram's 
        OAuth2 Login Widget for secure authentication.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Demo Mode:</strong> This button simulates Telegram authentication. 
        In production, this would be replaced with a real Telegram Login Widget 
        that requires a bot token and domain verification.
      </Alert>

      <Box 
        ref={containerRef} 
        display="flex" 
        justifyContent="center" 
        sx={{ minHeight: 40 }}
      />
    </Paper>
  );
};