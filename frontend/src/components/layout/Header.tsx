import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip
} from '@mui/material';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const { user, logout, isAuthenticated } = useAuth();

  const handleDisconnect = () => {
    disconnect();
    logout();
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Telegram Contacts POC
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          {isAuthenticated && user && (
            <Chip
              label={`${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
          )}
          
          {isConnected ? (
            <Button 
              color="inherit" 
              onClick={handleDisconnect}
              variant="outlined"
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              color="inherit" 
              onClick={() => open()}
              variant="outlined"
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};