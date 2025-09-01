import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private telegramService: TelegramService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('verify-auth')
  async verifyTelegramAuth(@Body() telegramUser: any, @Req() req) {
    const isValid = this.telegramService.verifyTelegramAuth(telegramUser);
    
    if (!isValid) {
      return { success: false, message: 'Invalid Telegram authentication' };
    }

    return {
      success: true,
      message: 'Telegram authentication verified',
      telegram_user: telegramUser,
      wallet_user: req.user,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('contacts')
  async getContacts(@Req() req) {
    // In a real implementation, you would get the telegram user ID from the database
    // For now, we'll use a mock telegram user ID
    const telegramUserId = 123456789;
    
    const contacts = await this.telegramService.getContacts(telegramUserId);
    
    return {
      success: true,
      contacts: contacts,
      note: 'This is mock data. Real Telegram contact retrieval requires additional setup and user permissions.'
    };
  }
}