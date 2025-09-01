# Telegram OAuth2 Contact Retrieval POC

A proof of concept TypeScript React application that demonstrates Telegram's OAuth2 authentication system with a focus on contact retrieval (with privacy limitations explained).

## Features

- ✅ Telegram OAuth2 authentication (supports 2FA)
- ✅ Material-UI (MUI) interface
- ✅ TypeScript with strict type checking
- ✅ Contact list UI (demo with mock data)
- ✅ Privacy-aware implementation notes

## Quick Start

### Prerequisites
- Node.js v22.18.0 (use nvm: `nvm use v22.18.0`)
- Telegram Bot Token (see setup instructions below)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Telegram bot credentials
   ```

3. **Development server:**
   ```bash
   ./npm_dev.sh
   # or: npm run dev
   ```

4. **Build for production:**
   ```bash
   ./npm_build.sh
   # or: npm run build
   ```

## Telegram Bot Setup

⚠️ **Important**: This requires a Telegram "bot" registration, but it's ONLY for OAuth2 authentication - not chatbot functionality.

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Choose a name (e.g., "YourSite Login")
4. Choose username (e.g., "yoursite_auth_bot")  
5. Copy the bot token → `VITE_TELEGRAM_BOT_TOKEN`
6. **Crucial**: Send `/setdomain localhost:5173` (for development)

## Privacy Limitations

Due to Telegram's privacy-first approach:

- ❌ Direct contact retrieval is not supported
- ❌ Bulk contact access is restricted
- ✅ Authentication works with full user profile
- ✅ Contact sharing requires explicit user consent
- ✅ Bot API supports `request_contact` for voluntary sharing

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run type-check` - TypeScript type checking
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/
│   ├── TelegramAuth.tsx    # OAuth2 login component
│   ├── ContactsList.tsx    # Contact display (mock data)
│   └── Header.tsx          # User profile header
├── App.tsx                 # Main application
└── main.tsx               # Entry point
```

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 7
- **UI**: Material-UI (MUI) 7
- **Authentication**: Telegram Login Widget
- **HTTP Client**: Axios

## Next Steps

See `.claude/commands/steps.md` for detailed implementation steps including:

- Backend authentication verification
- Alternative contact sharing approaches
- Production deployment considerations
- Bot API integration patterns

---

🔐 **Security Note**: This POC demonstrates authentication only. For production use, implement proper backend verification and follow Telegram's security guidelines.