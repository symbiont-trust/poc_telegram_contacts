# Telegram OAuth2 Contact Retrieval POC - Implementation Steps

## Project Overview
Create a proof of concept TypeScript React application that uses Telegram's authentication system to retrieve and display user contacts. The app will support both users with and without 2FA enabled.

## Technology Stack
- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Material-UI (MUI)
- **Node Version**: v22.18.0 (via nvm)
- **Authentication**: Telegram OAuth2/Login Widget

## Important Implementation Notes

### Telegram API Limitations for Contact Retrieval
Based on 2025 documentation research:
- **Privacy Protection**: Telegram prioritizes user privacy and does not allow direct contact retrieval without explicit user consent
- **Bot API Limitations**: Contact information can only be obtained through user-initiated sharing (request_contact keyboard button)
- **Available Methods**: 
  - `contacts.importContacts` - Upload local contacts to see which are on Telegram
  - `contacts.search` - Search contacts by username substring
  - Bot API contact sharing via KeyboardButton with `request_contact: true`

### Alternative Approach
Since direct contact retrieval is privacy-restricted, this POC will:
1. Implement Telegram OAuth2 authentication
2. Demonstrate contact sharing functionality via Bot API
3. Show user profile information available through OAuth
4. Simulate contact display with mock data to demonstrate the UI

## Implementation Steps

### Step 1: Project Setup and Structure
```bash
# Copy shell scripts to project root
cp sample_code/shell_scripts/npm_build.sh ./
cp sample_code/shell_scripts/npm_dev.sh ./
chmod +x npm_build.sh npm_dev.sh

# Create Vite React TypeScript project in current directory
# Note: Using '.' as target to install directly in project root
source ~/.nvm/nvm.sh && nvm use v22.18.0
npm create vite@latest . -- --template react-ts
npm install

# Install additional dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install axios
npm install @types/node
```

### Step 2: Environment Configuration
Create `.env` file:
```env
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_BOT_USERNAME=your_bot_username_here
VITE_APP_URL=http://localhost:5173
```

Create `.env.example`:
```env
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
VITE_APP_URL=http://localhost:5173
```

### Step 3: Telegram OAuth2 Setup (Bot Registration Required)

**Important Note**: Telegram's OAuth2 system requires a "bot" registration, but this bot is ONLY used for OAuth2 authentication - it's not a chatbot or messaging bot. Think of it like registering an OAuth2 app with Google or GitHub.

**What the "bot" actually does:**
- Provides a token for OAuth2 security verification
- Links your domain to Telegram's authentication system
- Acts as your app's identity in Telegram's OAuth2 flow
- **Does NOT involve any bot functionality, messaging, or chat features**

Create OAuth2 credentials via [@BotFather](https://t.me/botfather):
1. Send `/newbot` to @BotFather
2. Choose a name that represents your website (e.g., "YourSite Login")
3. Choose a username (e.g., "yoursite_auth_bot")
4. Copy the bot token - this is your OAuth2 client secret
5. **Crucial**: Send `/setdomain yourdomain.com` (or `localhost:5173` for development) to link your domain

**The bot will never send messages or interact with users - it's purely an OAuth2 credential system.**

### Step 4: Core Application Structure

#### Main App Component (src/App.tsx)
```typescript
import React, { useState } from 'react';
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
```

#### Telegram Authentication Component (src/components/TelegramAuth.tsx)
```typescript
import React, { useEffect } from 'react';
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

const TelegramAuth: React.FC<TelegramAuthProps> = ({ onAuth, loading }) => {
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
```

#### Contacts List Component (src/components/ContactsList.tsx)
```typescript
import React from 'react';
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

const ContactsList: React.FC<ContactsListProps> = ({ contacts }) => {
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
```

#### Header Component (src/components/Header.tsx)
```typescript
import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { Person } from '@mui/icons-material';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface HeaderProps {
  user: TelegramUser | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
      <Avatar src={user.photo_url}>
        <Person />
      </Avatar>
      <Box>
        <Typography variant="h6">
          Welcome, {user.first_name} {user.last_name}
        </Typography>
        {user.username && (
          <Chip label={`@${user.username}`} size="small" variant="outlined" />
        )}
      </Box>
    </Box>
  );
};

export default Header;
```

### Step 5: Backend Authentication Verification (Optional)
Create simple Express.js backend for auth verification:

#### Backend Setup (server/index.js)
```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());
app.use(express.static('dist'));

// Telegram auth verification
app.post('/api/telegram-auth', (req, res) => {
  const { hash, ...data } = req.body;
  
  // Create data-check-string
  const dataCheckString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');
  
  // Create secret key
  const secretKey = crypto
    .createHash('sha256')
    .update(process.env.VITE_TELEGRAM_BOT_TOKEN)
    .digest();
  
  // Calculate hash
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  if (calculatedHash === hash) {
    res.json({ success: true, user: data });
  } else {
    res.status(401).json({ success: false, error: 'Invalid authentication' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 6: Update package.json Scripts
Add to package.json:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

### Step 7: TypeScript Configuration
Update `tsconfig.json` to include proper types:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 8: Vite Configuration
Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Step 9: Development and Testing

#### Running the Application
```bash
# Start development server
./npm_dev.sh

# In another terminal, build for production
./npm_build.sh
```

#### Testing OAuth2 Flow
1. Open browser to `http://localhost:5173`
2. Click the Telegram login button
3. Complete authentication (supports both 2FA and non-2FA users)
4. Verify contact list display (mock data due to API limitations)

#### Testing 2FA Support
- The Telegram login widget automatically handles 2FA
- Users with 2FA enabled will go through additional verification steps
- No additional code needed as Telegram handles this natively

### Step 10: Production Considerations

#### Security
- Implement proper backend authentication verification
- Use HTTPS in production
- Store bot token securely (environment variables)
- Validate all user inputs

#### Contact Retrieval Alternatives
Since direct contact access is limited:
1. **Bot Integration**: Create Telegram bot with contact request functionality
2. **User Consent**: Implement explicit contact sharing mechanisms
3. **Gradual Access**: Request contacts through interactive bot conversations

#### Deployment
- Update VITE_APP_URL for production domain
- Configure Telegram bot domain settings
- Implement proper error handling and logging

## Key Implementation Notes

### Telegram API Limitations
- **Privacy First**: Telegram prioritizes user privacy over API convenience
- **No Direct Access**: Contact retrieval requires explicit user consent
- **Bot-Based Approach**: Most contact sharing happens through bot interactions

### 2FA Support
- **Automatic Handling**: Telegram login widget handles 2FA automatically
- **No Additional Code**: 2FA users will see additional verification steps
- **Seamless Experience**: Both 2FA and non-2FA users use the same flow

### Alternative Approaches
If contact retrieval is essential:
1. Implement Telegram bot with `request_contact` keyboard buttons
2. Use `contacts.importContacts` for users who upload their phone contacts
3. Implement social features where users voluntarily connect

This POC demonstrates the authentication flow and UI structure while acknowledging Telegram's privacy-focused API design.