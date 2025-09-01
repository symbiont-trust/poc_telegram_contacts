import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box } from '@mui/material';
import TelegramAuth from './components/TelegramAuth';
import ContactsList from './components/ContactsList';
import Header from './components/Header';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface Contact {
  id: string;
  name: string;
  phone?: string;
  username?: string;
  avatar?: string;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#0088cc',
    },
  },
});

function App() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTelegramAuth = async (userData: TelegramUser) => {
    setLoading(true);
    try {
      // Verify authentication with your backend
      const response = await fetch('/api/telegram-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        setUser(userData);
        // Simulate contact retrieval (in real implementation, this would be limited)
        setContacts([
          { id: '1', name: 'John Doe', username: 'johndoe', phone: '+1234567890' },
          { id: '2', name: 'Jane Smith', username: 'janesmith' },
          // Mock data since direct contact retrieval is privacy-restricted
        ]);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Header user={user} />
        <Box sx={{ mt: 4 }}>
          {!user ? (
            <TelegramAuth onAuth={handleTelegramAuth} loading={loading} />
          ) : (
            <ContactsList contacts={contacts} />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;