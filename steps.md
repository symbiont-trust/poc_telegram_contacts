# Telegram Contact Retrieval POC - Implementation Steps

## Project Overview
Create a proof of concept application that combines crypto wallet authentication with Telegram contact retrieval. Users authenticate with their crypto wallet (MetaMask, WalletConnect, etc.) via Reown's App Kit, then connect their Telegram account via OAuth2 to retrieve and display contacts.

## Architecture Overview

```
Frontend (React + Reown)     Backend (Nest.js)         External Services
┌─────────────────────┐     ┌─────────────────┐       ┌─────────────────┐
│ Wallet Connection   │────▶│ Signature Verify│       │ Wallet Providers│
│ Dashboard           │◀────│ JWT Management  │       │ (MetaMask, etc) │
│ Telegram OAuth2     │────▶│ Session Storage │◀─────▶│ PostgreSQL DB   │
│ Contacts Display    │◀────│ Telegram Proxy  │       │ Telegram OAuth2 │
└─────────────────────┘     └─────────────────┘       └─────────────────┘
```

## Technology Stack

### Frontend:
- **React 19** with TypeScript + Vite
- **Reown App Kit** (formerly WalletConnect AppKit) for wallet connectivity
- **Material-UI (MUI)** for UI components
- **Axios** for API communication
- **React Router** for navigation

### Backend:
- **Nest.js** with TypeScript
- **PostgreSQL** database with TypeORM
- **JWT** for session management
- **Passport.js** for authentication strategies
- **Telegram Login Widget** for OAuth2 (NOT Bot API)

### Development:
- **Node.js v22.18.0** (via nvm)
- **PostgreSQL** (local installation)
- **Concurrently** for running frontend/backend together

## Implementation Steps

### Step 0: PostgreSQL Database Setup

Before starting the project, set up the PostgreSQL database user and database:

```bash
# Connect to PostgreSQL as superuser
psql postgres

# Create user and database
CREATE USER poc_telegram_contacts WITH PASSWORD 'poc_telegram_contacts';
CREATE DATABASE poc_telegram_contacts OWNER poc_telegram_contacts;

# Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE poc_telegram_contacts TO poc_telegram_contacts;
GRANT CREATE ON SCHEMA public TO poc_telegram_contacts;
GRANT USAGE ON SCHEMA public TO poc_telegram_contacts;

# Exit PostgreSQL
\q

# Test the connection
psql -h localhost -U poc_telegram_contacts -d poc_telegram_contacts
# Enter password: poc_telegram_contacts
# You should see: poc_telegram_contacts=> 
# Type \q to exit
```

### Step 1: Project Structure Setup

```bash
# Create project structure (directories already exist)
mkdir -p frontend backend
```

Create root workspace configuration:

#### Root package.json
```json
{
  "name": "telegram-contacts-poc",
  "version": "1.0.0",
  "description": "Crypto Wallet + Telegram Contact Retrieval POC",
  "private": true,
  "workspaces": ["frontend", "backend"],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build", 
    "build:backend": "cd backend && npm run build",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "db:setup": "psql -h localhost -U poc_telegram_contacts -d poc_telegram_contacts -f backend/src/database/init.sql",
    "db:reset": "psql -h localhost -U poc_telegram_contacts -d poc_telegram_contacts -c \"DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT USAGE ON SCHEMA public TO poc_telegram_contacts; GRANT CREATE ON SCHEMA public TO poc_telegram_contacts;\" && npm run db:setup"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

#### Environment Variables (.env)
```env
# Database Configuration (Local PostgreSQL)
DATABASE_URL="postgresql://poc_telegram_contacts:poc_telegram_contacts@localhost:5432/poc_telegram_contacts"
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=poc_telegram_contacts
DB_PASSWORD=poc_telegram_contacts
DB_DATABASE=poc_telegram_contacts

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:5173

# Telegram OAuth2 Configuration (for Login Widget)
# Get from: https://my.telegram.org/apps OR create bot via @BotFather
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username_here

# Reown Configuration (get from: https://cloud.reown.com/)
REOWN_PROJECT_ID=your_reown_project_id_here
```

### Step 2: Backend Setup with Nest.js

```bash
cd backend
npm init -y
npx @nestjs/cli generate application . --skip-git --package-manager npm
```

#### Backend Dependencies
```bash
# Core dependencies
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config class-validator class-transformer
npm install bcrypt ethers

# Development dependencies  
npm install --save-dev @nestjs/cli @types/node typescript ts-node
npm install --save-dev @types/passport-jwt @types/bcrypt
```

#### Backend Structure
```
backend/
├── src/
│   ├── app.module.ts                 # Main application module
│   ├── main.ts                       # Application entry point
│   ├── auth/
│   │   ├── auth.module.ts           # Authentication module
│   │   ├── auth.service.ts          # Wallet signature verification
│   │   ├── auth.controller.ts       # Auth endpoints
│   │   ├── dto/auth.dto.ts          # Data transfer objects
│   │   ├── guards/jwt.guard.ts      # JWT authentication guard
│   │   └── strategies/jwt.strategy.ts # JWT strategy
│   ├── telegram/
│   │   ├── telegram.module.ts       # Telegram integration module
│   │   ├── telegram.service.ts      # Telegram OAuth2 handling
│   │   └── telegram.controller.ts   # Telegram endpoints
│   ├── database/
│   │   ├── entities/
│   │   │   ├── user.entity.ts       # User entity
│   │   │   └── session.entity.ts    # Session entity
│   │   └── init.sql                 # Database initialization
│   └── common/
│       ├── decorators/              # Custom decorators
│       └── interfaces/              # TypeScript interfaces
├── package.json
└── nest-cli.json
```

#### Database Schema (backend/src/database/init.sql)
```sql
-- Users table for wallet-authenticated users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for JWT token management
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    jwt_token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Telegram connections table
CREATE TABLE IF NOT EXISTS telegram_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    photo_url TEXT,
    auth_date INTEGER NOT NULL,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contacts table (retrieved from Telegram)
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    telegram_connection_id INTEGER NOT NULL,
    contact_telegram_id BIGINT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    username VARCHAR(255),
    phone_number VARCHAR(20),
    photo_url TEXT,
    last_seen TIMESTAMP,
    retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (telegram_connection_id) REFERENCES telegram_connections(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_jwt_hash ON sessions(jwt_token_hash);
CREATE INDEX IF NOT EXISTS idx_telegram_connections_user_id ON telegram_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_telegram_connection_id ON contacts(telegram_connection_id);
```

#### User Entity (backend/src/database/entities/user.entity.ts)
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Session } from './session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 42 })
  wallet_address: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Session, session => session.user)
  sessions: Session[];
}
```

#### Session Entity (backend/src/database/entities/session.entity.ts)
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ unique: true, length: 64 })
  jwt_token_hash: string;

  @Column()
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => User, user => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### Step 3: Backend Authentication Implementation

#### Auth Service (backend/src/auth/auth.service.ts)
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { createHash } from 'crypto';
import { User } from '../database/entities/user.entity';
import { Session } from '../database/entities/session.entity';
import { AuthDto, VerifySignatureDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private jwtService: JwtService,
  ) {}

  async verifyWalletSignature(verifyDto: VerifySignatureDto) {
    const { walletAddress, signature, message } = verifyDto;
    
    try {
      // Verify the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new UnauthorizedException('Invalid signature');
      }

      // Find or create user
      let user = await this.userRepository.findOne({ 
        where: { wallet_address: walletAddress.toLowerCase() } 
      });
      
      if (!user) {
        user = this.userRepository.create({ 
          wallet_address: walletAddress.toLowerCase() 
        });
        await this.userRepository.save(user);
      }

      // Create JWT token
      const payload = { sub: user.id, wallet: user.wallet_address };
      const token = this.jwtService.sign(payload);
      
      // Store session in database
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const session = this.sessionRepository.create({
        user_id: user.id,
        jwt_token_hash: tokenHash,
        expires_at: expiresAt,
      });
      await this.sessionRepository.save(session);

      return {
        access_token: token,
        user: {
          id: user.id,
          wallet_address: user.wallet_address,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Signature verification failed');
    }
  }

  async validateJWT(payload: any): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id: payload.sub } 
    });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    return user;
  }

  async logout(token: string): Promise<boolean> {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    
    const session = await this.sessionRepository.findOne({
      where: { jwt_token_hash: tokenHash }
    });
    
    if (session) {
      session.is_active = false;
      await this.sessionRepository.save(session);
      return true;
    }
    
    return false;
  }
}
```

#### Auth Controller (backend/src/auth/auth.controller.ts)
```typescript
import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { VerifySignatureDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('verify-signature')
  async verifySignature(@Body() verifyDto: VerifySignatureDto) {
    return this.authService.verifyWalletSignature(verifyDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req) {
    return {
      user: req.user,
      wallet_address: req.user.wallet_address,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const success = await this.authService.logout(token);
    return { success };
  }
}
```

#### Auth DTOs (backend/src/auth/dto/auth.dto.ts)
```typescript
import { IsString, IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class VerifySignatureDto {
  @IsEthereumAddress()
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
```

### Step 4: Frontend Setup with React + Reown App Kit

```bash
cd frontend
source ~/.nvm/nvm.sh && nvm use v22.18.0
npm create vite@latest . -- --template react-ts
npm install
```

#### Frontend Dependencies
```bash
# Core dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/lab
npm install @reown/appkit @reown/appkit-adapter-wagmi
npm install wagmi viem @tanstack/react-query
npm install axios react-router-dom
npm install ethers

# Development dependencies
npm install --save-dev @types/node
```

#### Frontend Structure
```
frontend/src/
├── components/
│   ├── wallet/
│   │   ├── WalletConnect.tsx        # Reown App Kit integration
│   │   ├── WalletButton.tsx         # Connect/disconnect button
│   │   └── WalletInfo.tsx           # Display wallet info
│   ├── auth/
│   │   ├── AuthGuard.tsx            # Protected route wrapper
│   │   └── SignMessage.tsx          # Message signing component
│   ├── telegram/
│   │   ├── TelegramConnect.tsx      # Telegram OAuth2 integration
│   │   ├── TelegramLogin.tsx        # Telegram login widget
│   │   └── ContactsList.tsx         # Display retrieved contacts
│   ├── layout/
│   │   ├── Header.tsx               # App header with wallet info
│   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   └── Layout.tsx               # Main layout wrapper
│   └── common/
│       ├── LoadingSpinner.tsx       # Loading states
│       └── ErrorBoundary.tsx        # Error handling
├── services/
│   ├── api.ts                       # Axios configuration
│   ├── auth.ts                      # Authentication service
│   └── telegram.ts                  # Telegram API service
├── hooks/
│   ├── useAuth.ts                   # Authentication hook
│   ├── useWallet.ts                 # Wallet connection hook
│   └── useTelegram.ts               # Telegram integration hook
├── types/
│   ├── auth.types.ts                # Authentication types
│   ├── wallet.types.ts              # Wallet types
│   └── telegram.types.ts            # Telegram types
├── contexts/
│   └── AuthContext.tsx              # Global auth state
├── config/
│   └── wagmi.ts                     # Wagmi configuration
├── App.tsx                          # Main app component
└── main.tsx                         # Entry point
```

#### Wagmi Configuration (frontend/src/config/wagmi.ts)
```typescript
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { arbitrum, mainnet, polygon } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

const metadata = {
  name: 'Telegram Contacts POC',
  description: 'Crypto Wallet + Telegram Contact Retrieval',
  url: 'http://localhost:5173',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const networks = [mainnet, arbitrum, polygon];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
});

export const config = wagmiAdapter.wagmiConfig;

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
});

export { queryClient };
```

#### Main App Component (frontend/src/App.tsx)
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { config, queryClient } from './config/wagmi';
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

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <Layout>
                <Container maxWidth="lg">
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
                </Container>
              </Layout>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
```

#### Wallet Connection Component (frontend/src/components/wallet/WalletConnect.tsx)
```typescript
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
import { useAuth } from '../../hooks/useAuth';
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
      const message = `Sign this message to authenticate with your wallet.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      
      const signature = await signMessage({ message });
      
      const result = await login({
        walletAddress: address,
        signature,
        message
      });
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
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
              Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </Alert>
            
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
```

### Step 5: Telegram OAuth2 Integration

#### Telegram Service (backend/src/telegram/telegram.service.ts)
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac } from 'crypto';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

@Injectable()
export class TelegramService {
  constructor(private configService: ConfigService) {}

  verifyTelegramAuth(userData: TelegramUser): boolean {
    const { hash, ...data } = userData;
    
    // Create data-check-string
    const dataCheckString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('\n');
    
    // Create secret key from bot token
    const secretKey = createHash('sha256')
      .update(this.configService.get<string>('TELEGRAM_BOT_TOKEN'))
      .digest();
    
    // Calculate expected hash
    const expectedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return expectedHash === hash;
  }

  // Note: Telegram Login Widget doesn't provide direct contact access
  // This would require additional API calls with user's session
  async getContacts(telegramUserId: number): Promise<any[]> {
    // In a real implementation, this would require:
    // 1. User to grant contact access through a Telegram bot
    // 2. Or use Telegram Client API (more complex setup)
    
    // For POC purposes, return mock data with explanation
    return [
      {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe',
        phone_number: '+1234567890',
        note: 'Mock data - Real contacts require additional Telegram API setup'
      },
      {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        username: 'janesmith',
        note: 'Mock data - Telegram prioritizes user privacy'
      }
    ];
  }
}
```

#### Telegram Login Widget Component (frontend/src/components/telegram/TelegramLogin.tsx)
```typescript
import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginProps {
  botUsername: string;
  onAuth: (user: TelegramUser) => void;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

export const TelegramLogin: React.FC<TelegramLoginProps> = ({ 
  botUsername, 
  onAuth 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up callback
    window.onTelegramAuth = onAuth;

    // Create and append Telegram script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      // Cleanup
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.onTelegramAuth;
    };
  }, [botUsername, onAuth]);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Connect Your Telegram Account
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Link your Telegram account to access your contacts. This supports both 
        users with and without 2FA enabled.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Privacy Notice:</strong> Due to Telegram's privacy policies, 
        contact access is limited. This demo shows the authentication flow 
        and displays mock contact data.
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
```

### Step 6: Development Environment Setup

#### Database Setup Commands
```bash
# Set up PostgreSQL user and database (run these first)
psql postgres
CREATE USER poc_telegram_contacts WITH PASSWORD 'poc_telegram_contacts';
CREATE DATABASE poc_telegram_contacts OWNER poc_telegram_contacts;
GRANT ALL PRIVILEGES ON DATABASE poc_telegram_contacts TO poc_telegram_contacts;
GRANT CREATE ON SCHEMA public TO poc_telegram_contacts;
GRANT USAGE ON SCHEMA public TO poc_telegram_contacts;
\q

# Install root dependencies
source ~/.nvm/nvm.sh && nvm use v22.18.0
npm install

# Install all workspace dependencies
npm run install:all

# Set up database tables
npm run db:setup
```

#### Development Workflow
```bash
# Start both frontend and backend
npm run dev

# Or run individually:
npm run dev:frontend  # React on port 5173
npm run dev:backend   # Nest.js on port 3001

# Database management
npm run db:setup      # Create tables from init.sql
npm run db:reset      # Drop and recreate all tables

# Build for production
npm run build
```

### Step 7: Telegram Bot Setup (for Login Widget)

#### Create Telegram Bot for OAuth2
1. **Message @BotFather on Telegram:**
   - Send `/newbot`
   - Choose name: "Your App Login" 
   - Choose username: "yourapp_auth_bot"
   - Copy the bot token

2. **Configure Domain:**
   - Send `/setdomain` to @BotFather
   - Select your bot
   - Set domain: `localhost:5173` (development)

3. **Update Environment Variables:**
   ```env
   TELEGRAM_BOT_TOKEN=1234567890:ABC-DEF...
   TELEGRAM_BOT_USERNAME=yourapp_auth_bot
   ```

### Step 8: Production Deployment Considerations

#### Security Measures:
- Use HTTPS in production
- Secure JWT secrets and database credentials
- Implement rate limiting
- Add request validation and sanitization
- Use environment-specific configurations

#### Database Configuration:
- Use managed PostgreSQL service (AWS RDS, etc.) for production
- Implement connection pooling
- Add database migrations
- Regular backups and monitoring

#### Frontend Deployment:
- Build optimized production bundle
- Configure proper CORS origins
- Use CDN for static assets
- Implement error tracking (Sentry, etc.)

#### Backend Deployment:
- Use PM2 or similar for process management
- Configure proper logging
- Health check endpoints
- Graceful shutdown handling

## Key Implementation Notes

### Authentication Flow:
1. **Wallet Connection**: User connects crypto wallet via Reown App Kit
2. **Message Signing**: Frontend requests wallet signature for auth message
3. **Backend Verification**: Server verifies signature and creates JWT
4. **Session Storage**: JWT stored in PostgreSQL for session management
5. **Telegram OAuth2**: Authenticated user can connect Telegram account
6. **Contact Access**: Limited by Telegram's privacy policies (mock data shown)

### Privacy Limitations:
- Telegram Login Widget provides user profile data only
- Direct contact access requires additional bot interactions or Client API
- This POC demonstrates the authentication flow with mock contact data
- Real contact retrieval would need user consent through bot commands

### Development Tips:
- Use browser dev tools to debug wallet connections
- Monitor database queries during development
- Test with different wallet providers (MetaMask, WalletConnect)
- Verify Telegram OAuth2 flow with different user accounts

This implementation provides a complete foundation for crypto wallet + Telegram authentication with proper session management and scalable architecture.