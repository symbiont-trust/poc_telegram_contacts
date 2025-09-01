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
- **Node.js v22.18.0** (use nvm: `nvm use v22.18.0`)
- **Telegram Account** (mobile, desktop, or web)
- **Telegram Bot Token** (we'll create this together - see setup below)

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

4. **Run the app:**
   ```bash
   ./npm_dev.sh
   # or: npm run dev
   ```
   - App will be available at: http://localhost:5173
   - You should see a "Sign in with Telegram" button (after bot setup)

5. **Build for production:**
   ```bash
   ./npm_build.sh
   # or: npm run build
   ```

## Telegram Bot Setup

⚠️ **Important**: This requires a Telegram "bot" registration, but it's ONLY for OAuth2 authentication - not chatbot functionality.

### Step 1: Access BotFather

**Option 1 - Direct Link:**
- Click: https://t.me/botfather (opens Telegram automatically)

**Option 2 - Search in Telegram:**
1. Open Telegram (mobile/desktop/web)
2. Search for `@BotFather` 
3. Look for the bot with the blue verification checkmark ✓
4. Click to start chatting

### Step 2: Create Your Bot

1. **Start the conversation:**
   ```
   Send: /start
   ```
   (BotFather will show you available commands)

2. **Create new bot:**
   ```
   Send: /newbot
   ```

3. **Choose display name:**
   ```
   BotFather asks: "How are we going to call it?"
   Send: Telegram Contacts POC
   (or: YourSite Login, My App Login, etc.)
   ```

4. **Choose username:**
   ```
   BotFather asks: "Now let's choose a username for your bot"
   Send: yoursite_auth_bot
   ```
   - Must end with `bot`
   - Must be unique across all Telegram
   - Try variations if taken: `myapp_login_bot`, `yourname_auth_bot`

5. **Save your credentials:**
   ```
   BotFather responds with:
   "Done! Congratulations on your new bot..."
   
   Copy the TOKEN → this goes in VITE_TELEGRAM_BOT_TOKEN
   Copy the username → this goes in VITE_TELEGRAM_BOT_USERNAME
   ```

### Step 3: Configure Domain (Critical!)

1. **Set domain for login widget:**
   ```
   Send: /setdomain
   ```

2. **Select your bot:**
   - BotFather will list your bots
   - Click on the bot you just created

3. **Enter domain:**
   ```
   For development:
   Send: localhost:5173
   
   For production:
   Send: yourdomain.com
   ```

### Step 4: Update Environment File

Edit your `.env` file:
```env
VITE_TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmNoPQRsTuVwXyZ123456789
VITE_TELEGRAM_BOT_USERNAME=yoursite_auth_bot
VITE_APP_URL=http://localhost:5173
```

### Troubleshooting

**If login widget doesn't appear:**
- Check bot token is correct
- Verify domain is set in BotFather (`/setdomain`)
- Make sure username matches exactly
- Try hard refresh (Ctrl+F5 / Cmd+Shift+R)

**If username is taken:**
- Try: `yourname_contacts_bot`
- Try: `myapp_telegram_bot` 
- Try: `sitename_login_bot`

**Common mistakes:**
- ❌ Using bot token as username
- ❌ Forgetting to set domain with `/setdomain`
- ❌ Username doesn't end with `bot`
- ❌ Wrong environment variable names

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

## FAQ

**Q: Why do I need to create a "bot" for OAuth2?**  
A: Telegram's OAuth2 system requires bot registration for security. The bot acts like OAuth2 credentials (similar to Google/GitHub app registration) - it won't send messages or chat.

**Q: Will this bot spam users or appear in their chat list?**  
A: No! The bot is purely for authentication. Users will only see it during the login process.

**Q: Can I retrieve all of a user's contacts?**  
A: No, Telegram prioritizes privacy. Contacts must be shared voluntarily through bot interactions with explicit user consent.

**Q: Does this work with 2FA enabled accounts?**  
A: Yes! The Telegram login widget handles 2FA automatically.

**Q: What user data do I get after authentication?**  
A: User ID, name, username (if set), profile photo, and authentication timestamp - no contacts or private data.

---

🔐 **Security Note**: This POC demonstrates authentication only. For production use, implement proper backend verification and follow Telegram's security guidelines.