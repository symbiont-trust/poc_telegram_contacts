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
    
    // Create secret key from API hash (for Login Widget verification)
    const secretKey = createHash('sha256')
      .update(this.configService.get<string>('TELEGRAM_API_HASH'))
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