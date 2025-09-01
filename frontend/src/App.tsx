import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { WalletConnect } from './components/wallet/WalletConnect';
import { Dashboard } from './components/dashboard/Dashboard';
import { AuthGuard } from './components/auth/AuthGuard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#0088cc', // Telegram blue
    },
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<WalletConnect />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <AuthGuard>
                        <Dashboard />
                      </AuthGuard>
                    } 
                  />
                </Routes>
              </Layout>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;