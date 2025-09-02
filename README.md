# Telegram Contacts POC

A proof of concept application that combines crypto wallet authentication with Telegram contact retrieval. Users authenticate with their crypto wallet via Reown's App Kit, then connect their Telegram account via OAuth2 to retrieve and display contacts.

## 🏗️ Architecture

```
Frontend (React + Reown)     Backend (Nest.js)         External Services
┌─────────────────────┐     ┌─────────────────┐       ┌─────────────────┐
│ Wallet Connection   │────▶│ Signature Verify│       │ Wallet Providers│
│ Dashboard           │◀────│ JWT Management  │       │ (MetaMask, etc) │
│ Telegram OAuth2     │────▶│ Session Storage │◀─────▶│ PostgreSQL DB   │
│ Contacts Display    │◀────│ Telegram Proxy  │       │ Telegram OAuth2 │
└─────────────────────┘     └─────────────────┘       └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript + Vite
- **Reown App Kit** (formerly WalletConnect AppKit) for wallet connectivity
- **Material-UI (MUI)** for UI components
- **Axios** for API communication
- **React Router** for navigation

### Backend
- **Nest.js** with TypeScript
- **PostgreSQL** database with TypeORM
- **JWT** for session management
- **Passport.js** for authentication strategies
- **Telegram Login Widget** for OAuth2 (NOT Bot API)

## 📋 Prerequisites

- **Node.js v22.18.0** (use nvm)
- **PostgreSQL** (local installation)
- **Git**

## 🚀 Quick Start

### 1. Database Setup

First, set up PostgreSQL database and user:

```bash
# Connect to PostgreSQL as superuser
psql postgres

# Create user and database
CREATE USER poc_telegram_contacts WITH PASSWORD 'poc_telegram_contacts';
CREATE DATABASE poc_telegram_contacts OWNER poc_telegram_contacts;
GRANT ALL PRIVILEGES ON DATABASE poc_telegram_contacts TO poc_telegram_contacts;
GRANT CREATE ON SCHEMA public TO poc_telegram_contacts;
GRANT USAGE ON SCHEMA public TO poc_telegram_contacts;

# Exit PostgreSQL
\q

# Test the connection
psql -h localhost -U poc_telegram_contacts -d poc_telegram_contacts
# Enter password: poc_telegram_contacts
# Type \q to exit
```

### 2. Environment Configuration

Create and configure environment files for both backend and frontend:

**Backend Environment (`backend/.env`):**

```env
# Database Configuration (Local PostgreSQL)
DATABASE_URL="postgresql://poc_telegram_contacts:poc_telegram_contacts@localhost:5432/poc_telegram_contacts"
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=poc_telegram_contacts
DB_PASSWORD=poc_telegram_contacts
DB_DATABASE=poc_telegram_contacts

# JWT Configuration
JWT_SECRET=super_secure_jwt_secret_for_poc_demo_2024
JWT_EXPIRES_IN=7d

# Server Configuration
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:5173

# Telegram Login Widget Configuration
# Get from: https://my.telegram.org/apps (NOT @BotFather)
TELEGRAM_API_ID=your_telegram_api_id_here
TELEGRAM_API_HASH=your_telegram_api_hash_here
```

**Frontend Environment (`frontend/.env`):**

```env
VITE_BACKEND_URL=http://localhost:3001
# ⚠️  IMPORTANT: Replace with your real Reown project ID from https://cloud.reown.com/
VITE_REOWN_PROJECT_ID=your_real_reown_project_id_here
```

### 3. Get Reown Project ID (Required for Wallet Connections)

1. Go to [https://cloud.reown.com/](https://cloud.reown.com/)
2. Sign up/Login
3. Create a new project
4. Copy your Project ID
5. Replace `your_real_reown_project_id_here` in both `.env` files

### 4. Installation & Setup

```bash
# Use correct Node version
source ~/.nvm/nvm.sh && nvm use v22.18.0

# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all

# Set up database tables
npm run db:setup
```

### 5. Development

**Option A: Run both servers together**
```bash
npm run dev
```

**Option B: Run servers individually**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

### 6. Access the Application

- **Frontend**: http://localhost:5173 (or 5174 if 5173 is in use)
- **Backend API**: http://localhost:3001

## 🎯 Usage Flow

1. **Connect Wallet**: Click "Connect Wallet" and choose your wallet provider
2. **Sign Message**: Sign the authentication message (free, no gas fees)
3. **Access Dashboard**: View your wallet information and connection status
4. **Connect Telegram**: Click the mock Telegram login button
5. **View Contacts**: See mock contact data (real contacts require additional setup)

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Run both frontend and backend
npm run dev:frontend     # Run frontend only
npm run dev:backend      # Run backend only

# Database
npm run db:setup         # Create tables from init.sql
npm run db:reset         # Drop and recreate all tables

# Build
npm run build            # Build both frontend and backend
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Dependencies
npm run install:all      # Install all workspace dependencies
```

## 📁 Project Structure

```
poc_telegram_contacts/
├── package.json                  # Root workspace configuration
├── README.md                     # This file
├── backend/
│   ├── .env                      # Backend environment variables
│   ├── src/
│   │   ├── auth/                 # Authentication module
│   │   ├── telegram/             # Telegram integration
│   │   ├── database/             # Entities and schema
│   │   ├── main.ts               # Application entry point
│   │   └── app.module.ts         # Main app module
│   ├── package.json
│   └── nest-cli.json
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── contexts/             # React contexts
│   │   ├── services/             # API services
│   │   ├── hooks/                # Custom hooks
│   │   ├── types/                # TypeScript types
│   │   ├── config/               # App configuration
│   │   ├── App.tsx               # Main app component
│   │   └── main.tsx              # Entry point
│   ├── .env                      # Frontend environment variables
│   └── package.json
└── sample_code/                  # Additional reference code
```

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use**
- Frontend will auto-select next available port (5174, 5175, etc.)
- Backend CORS is configured for both 5173 and 5174

**2. Database connection failed**
- Verify PostgreSQL is running: `brew services list | grep postgresql`
- Start if needed: `brew services start postgresql`
- Check connection: `psql -h localhost -U poc_telegram_contacts -d poc_telegram_contacts`

**3. Wallet connection not working**
- Ensure you have a valid Reown project ID in both `.env` files
- Check browser console for errors
- Try clearing browser cache/localStorage

**4. Node version issues**
- Always use Node v22.18.0: `nvm use v22.18.0`
- Reinstall dependencies if switching Node versions

**5. Backend not starting**
- Check if `.env` file exists in root directory
- Verify database is accessible
- Ensure all environment variables are set

### Reset Everything

```bash
# Kill any running processes
pkill -f "nest start"
pkill -f "vite"

# Reset database
npm run db:reset

# Clean install
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all

# Restart
npm run dev
```

## 📝 Important Notes

### Demo Limitations

- **Telegram Integration**: Uses mock authentication and contact data
- **Wallet Support**: Requires valid Reown project ID for real wallet connections
- **Contact Access**: Real Telegram contact access requires additional API setup and user permissions

### Production Considerations

- Replace demo Reown project ID with production ID
- Set up Telegram Login Widget with domain verification
- Use managed PostgreSQL service (AWS RDS, etc.)
- Implement proper logging, monitoring, and security headers
- Add rate limiting and request validation
- Use HTTPS and secure environment variable management

### Security Features

- Wallet signature verification using ethers.js
- JWT session management with database storage
- CORS protection for frontend communication
- Input validation with class-validator
- SQL injection protection via TypeORM

## 🆘 Support

If you encounter issues:

1. Check this README for troubleshooting steps
2. Verify all environment variables are correctly set
3. Ensure PostgreSQL is running and accessible
4. Check that you're using Node v22.18.0
5. Review browser console and terminal logs for errors

## 📄 License

This is a proof of concept project for demonstration purposes.