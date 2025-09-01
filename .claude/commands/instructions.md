# Instructions

I want to create a proof of concept application that combines crypto wallet authentication with Telegram contact retrieval. The app will have both a frontend and backend component with the following requirements:

## Architecture Overview

**Frontend**: React TypeScript app using Vite + Reown's App Kit for crypto wallet connectivity
**Backend**: Nest.js application with PostgreSQL database for JWT token management
**Authentication Flow**: 
1. Users authenticate using their crypto wallet (MetaMask, WalletConnect, etc.)
2. Backend verifies wallet signature and creates JWT token stored in PostgreSQL
3. Authenticated users can then connect their Telegram account via OAuth2
4. Retrieve and display user's Telegram contacts

## Technology Stack

### Frontend:
- **Framework**: React with TypeScript + Vite
- **UI Library**: Material-UI (mui.com)
- **Wallet Integration**: Reown's App Kit (formerly WalletConnect AppKit)
- **HTTP Client**: Axios for API communication
- **Routing**: React Router for navigation

### Backend:
- **Framework**: Nest.js with TypeScript
- **Database**: PostgreSQL (local installation) for user sessions and JWT token management
- **Authentication**: 
  - Crypto wallet signature verification
  - JWT tokens for session management
  - Telegram OAuth2 for contact access
- **Telegram Integration**: Official Telegram OAuth2 (not Bot API)

## Project Structure

The project should be organized as follows:

```
poc_telegram_contacts/
├── frontend/                 # React TypeScript app
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Nest.js application
│   ├── src/
│   ├── package.json
│   └── nest-cli.json
├── package.json              # Root workspace configuration
├── .env                      # Environment variables
└── README.md                 # Project documentation
```

## Authentication Flow Requirements

1. **Wallet Authentication**:
   - User connects crypto wallet via Reown App Kit
   - Frontend requests wallet signature for authentication message
   - Backend verifies wallet signature and creates JWT token
   - JWT token stored in PostgreSQL with user session data

2. **Telegram OAuth2 Integration**:
   - Once wallet-authenticated, user can connect Telegram account
   - Use Telegram's official OAuth2 (Login Widget) - NOT the Bot API approach
   - Telegram handles 2FA automatically (supports both 2FA and non-2FA users)
   - Retrieve user's Telegram contacts after successful OAuth2

3. **Session Management**:
   - JWT tokens managed in PostgreSQL database
   - Secure session handling with token refresh capabilities
   - Logout functionality to invalidate tokens

## User Interface Requirements

- **Landing Page**: Crypto wallet connection interface using Reown App Kit
- **Dashboard**: Once authenticated, show user's wallet address and Telegram connection status
- **Telegram Integration**: Material-UI button to trigger Telegram OAuth2 process
- **Contacts Display**: Paginated list of retrieved Telegram contacts with search functionality
- **User Profile**: Display connected wallet address and Telegram user information

## Technical Requirements

- **Node Version**: v22.18.0 (use existing nvm setup)
- **Database**: PostgreSQL (local installation) with proper indexing for JWT token lookups
- **Database Setup**: Create dedicated user `poc_telegram_contacts` with password `poc_telegram_contacts`
- **Security**: 
  - Secure JWT token management
  - Proper CORS configuration
  - Input validation and sanitization
  - Rate limiting on authentication endpoints
- **Error Handling**: Comprehensive error handling for wallet connection and Telegram OAuth2 flows

## Telegram Contact Retrieval

The application should use Telegram's official OAuth2 system:
- **NOT the Bot API approach** (which requires bot creation)
- Use Telegram Login Widget for web applications
- Automatically handles 2FA when present
- Retrieves user profile information and contacts (with privacy limitations explained)
- Handle Telegram's privacy restrictions gracefully

## Development Environment

- Use the existing shell scripts from `sample_code/shell_scripts/`
- Set up both frontend and backend to run concurrently in development
- Frontend should run on port 5173 (Vite default)
- Backend should run on port 3001
- PostgreSQL should use local installation with dedicated user setup

## Database Setup Requirements

Before implementing the application, set up PostgreSQL:

```bash
# Connect to PostgreSQL as superuser
psql postgres

# Create dedicated user and database
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
# Should prompt for password: poc_telegram_contacts
```

This approach avoids Docker dependency and uses a dedicated database user for better security isolation.

## Generated Steps.md Requirements

The generated steps.md file should:
1. Include detailed setup for both frontend and backend
2. Provide code examples for Reown App Kit integration
3. Include Nest.js setup with local PostgreSQL configuration (no Docker)
4. Show complete authentication flow implementation
5. Demonstrate Telegram OAuth2 integration (not Bot API)
6. Include database schema and JWT token management
7. Provide error handling and security best practices
8. Include development and production deployment instructions
9. Include PostgreSQL user setup commands as Step 0

The steps.md should be comprehensive enough that someone can follow it to build the complete application without additional research.

