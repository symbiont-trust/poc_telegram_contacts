import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />
      <Box sx={{ py: 3 }}>
        {children}
      </Box>
    </Box>
  );
};