import React, { useState } from 'react';
import { Box, Typography, Paper, Alert, TextField, Button, CircularProgress } from '@mui/material';
import type { TelegramUser } from '../../types/telegram.types';
import { api } from '../../services/api';

interface TelegramLoginProps {
  onAuth: (user: TelegramUser) => void;
}

export const TelegramLogin: React.FC<TelegramLoginProps> = ({ onAuth }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'code' | 'authenticated'>('phone');
  const [error, setError] = useState<string | null>(null);
  const [phoneCodeHash, setPhoneCodeHash] = useState<string>('');

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/telegram/send-code', { 
        phone_number: phoneNumber 
      });
      
      if (response.data.success) {
        setPhoneCodeHash(response.data.phone_code_hash);
        setStep('code');
      } else {
        setError(response.data.message || 'Failed to send verification code');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/telegram/sign-in', {
        phone_number: phoneNumber,
        phone_code: verificationCode,
        phone_code_hash: phoneCodeHash
      });
      
      if (response.data.success) {
        setStep('authenticated');
        onAuth(response.data.user);
      } else {
        setError(response.data.message || 'Invalid verification code');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Connect Your Telegram Account
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter your phone number to authenticate with Telegram and access your contacts.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {step === 'phone' && (
        <Box>
          <TextField
            fullWidth
            label="Phone Number"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSendCode}
            disabled={loading}
            fullWidth
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Sending Code...
              </>
            ) : (
              'Send Verification Code'
            )}
          </Button>
        </Box>
      )}

      {step === 'code' && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            A verification code has been sent to your Telegram app. Please enter it below.
          </Alert>
          <TextField
            fullWidth
            label="Verification Code"
            placeholder="12345"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleVerifyCode}
            disabled={loading}
            fullWidth
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        </Box>
      )}

      {step === 'authenticated' && (
        <Alert severity="success">
          Successfully authenticated with Telegram!
        </Alert>
      )}
    </Paper>
  );
};