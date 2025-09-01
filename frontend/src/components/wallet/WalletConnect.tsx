import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  CircularProgress 
} from '@mui/material';
import { useAccount, useSignMessage } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const WalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { signMessage } = useSignMessage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignAndAuth = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const message = `Sign this message to authenticate with your wallet.

Wallet: ${address}
Timestamp: ${Date.now()}

This request will not trigger a blockchain transaction or cost any gas fees.`;
      
      const signature = await signMessage({ message });
      
      if (signature) {
        const result = await login({
          walletAddress: address,
          signature,
          message
        });
        
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Authentication failed');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('User rejected')) {
        setError('Signature was rejected. Please try again.');
      } else {
        setError('Authentication failed. Please try again.');
      }
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="80vh"
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Telegram Contacts POC
        </Typography>
        
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
          Connect your crypto wallet to get started, then link your Telegram account 
          to retrieve your contacts.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isConnected ? (
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Supports MetaMask, WalletConnect, and other popular wallets
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => open()}
              fullWidth
            >
              Connect Wallet
            </Button>
          </Box>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              <strong>Wallet connected:</strong><br />
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Alert>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please sign a message to verify wallet ownership. This is free and doesn't use gas.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={handleSignAndAuth}
              disabled={loading}
              fullWidth
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Signing Message...
                </>
              ) : (
                'Sign Message & Continue'
              )}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};