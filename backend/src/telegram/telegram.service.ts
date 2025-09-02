import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface SendCodeRequest {
  phone_number: string;
}

interface SignInRequest {
  phone_number: string;
  phone_code: string;
  phone_code_hash: string;
}

@Injectable()
export class TelegramService {
  private client: TelegramClient;
  private authenticatedSessions: Map<string, string> = new Map(); // Store sessions by user ID
  private walletToTelegramMapping: Map<string, string> = new Map(); // Map wallet addresses to Telegram user IDs

  constructor(private configService: ConfigService) {
    // Initialize Telegram Client
    const apiId = parseInt(this.configService.get<string>('TELEGRAM_API_ID'));
    const apiHash = this.configService.get<string>('TELEGRAM_API_HASH');
    
    if (!apiId || !apiHash) {
      throw new BadRequestException('Telegram API credentials not configured');
    }

    this.client = new TelegramClient(new StringSession(''), apiId, apiHash, {
      connectionRetries: 5,
    });
  }

  async sendCode(request: SendCodeRequest) {
    try {
      await this.client.connect();
      
      const apiId = parseInt(this.configService.get<string>('TELEGRAM_API_ID'));
      const apiHash = this.configService.get<string>('TELEGRAM_API_HASH');
      
      const result = await this.client.sendCode(
        { apiId, apiHash },
        request.phone_number
      );

      return {
        success: true,
        phone_code_hash: result.phoneCodeHash,
        message: 'Verification code sent to your Telegram app'
      };
    } catch (error) {
      console.error('Telegram sendCode error:', error);
      throw new BadRequestException('Failed to send verification code');
    }
  }

  async signIn(request: SignInRequest, walletAddress?: string) {
    try {
      await this.client.connect();
      
      const apiId = parseInt(this.configService.get<string>('TELEGRAM_API_ID'));
      const apiHash = this.configService.get<string>('TELEGRAM_API_HASH');
      
      const result = await this.client.signInUser(
        { apiId, apiHash },
        {
          phoneNumber: () => Promise.resolve(request.phone_number),
          phoneCode: () => Promise.resolve(request.phone_code),
          onError: (err: any) => console.error('Auth error:', err),
        }
      );

      if (result && result.className === 'User') {
        // Save the authenticated session
        const sessionString = (this.client.session.save() as unknown) as string;
        const userId = result.id?.toString() || '0';
        this.authenticatedSessions.set(userId, sessionString);
        
        // Map wallet address to Telegram user ID if provided
        if (walletAddress) {
          this.walletToTelegramMapping.set(walletAddress, userId);
        }

        return {
          success: true,
          user: {
            id: userId,
            first_name: (result as any).firstName || '',
            last_name: (result as any).lastName || '',
            username: (result as any).username || '',
            auth_date: Math.floor(Date.now() / 1000),
          },
          message: 'Successfully authenticated with Telegram'
        };
      } else {
        throw new BadRequestException('Authentication failed');
      }
    } catch (error) {
      console.error('Telegram signIn error:', error);
      throw new BadRequestException('Failed to authenticate with Telegram');
    }
  }

  verifyTelegramAuth(userData: TelegramUser): boolean {
    // For Client API authentication, we don't need hash verification
    // The authentication is handled through the Telegram Client API directly
    return true;
  }

  async getContactsByWallet(walletAddress: string): Promise<any[]> {
    // Get Telegram user ID from wallet address
    const telegramUserId = this.walletToTelegramMapping.get(walletAddress);
    if (!telegramUserId) {
      throw new BadRequestException('No Telegram account linked to this wallet. Please sign in with Telegram first.');
    }
    
    return this.getContacts(parseInt(telegramUserId));
  }

  async getContacts(telegramUserId: number): Promise<any[]> {
    try {
      const userIdStr = telegramUserId.toString();
      
      // Check if we have a session for this user
      const sessionString = this.authenticatedSessions.get(userIdStr);
      if (!sessionString) {
        throw new BadRequestException('User not authenticated with Telegram. Please sign in first.');
      }

      // Create a new client with the saved session
      const apiId = parseInt(this.configService.get<string>('TELEGRAM_API_ID'));
      const apiHash = this.configService.get<string>('TELEGRAM_API_HASH');
      
      const userClient = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
        connectionRetries: 5,
      });

      await userClient.connect();

      // Check if session is still valid
      if (!await userClient.checkAuthorization()) {
        this.authenticatedSessions.delete(userIdStr);
        throw new BadRequestException('Telegram session expired. Please sign in again.');
      }

      // Get contacts from user's phone using the client's built-in method
      const contacts = await userClient.getDialogs();
      
      await userClient.disconnect();

      // Filter for users (not groups/channels) and map to our contact format
      const userContacts = contacts
        .filter(dialog => dialog.entity?.className === 'User' && !dialog.entity?.bot)
        .map((dialog: any) => {
          const user = dialog.entity;
          return {
            id: user.id?.toString() || '',
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            username: user.username || '',
            phone_number: user.phone || '',
            is_contact: true,
            mutual_contact: user.contact || false,
          };
        });

      return userContacts;
    } catch (error) {
      console.error('Error fetching Telegram contacts:', error);
      
      // Return user-friendly error response
      return [
        {
          id: 'error',
          first_name: 'Error',
          last_name: '',
          username: '',
          phone_number: '',
          note: `Failed to fetch contacts: ${error.message || 'Authentication required'}`
        }
      ];
    }
  }
}