import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private telegramService: TelegramService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('send-code')
  async sendCode(@Body() request: { phone_number: string }) {
    return await this.telegramService.sendCode(request);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('sign-in')
  async signIn(@Body() request: { phone_number: string; phone_code: string; phone_code_hash: string }, @Req() req) {
    const walletAddress = req.user?.wallet_address;
    return await this.telegramService.signIn(request, walletAddress);
  }

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
    try {
      const walletAddress = req.user?.wallet_address;
      if (!walletAddress) {
        throw new Error('Wallet address not found');
      }

      const contacts = await this.telegramService.getContactsByWallet(walletAddress);
      
      return {
        success: true,
        contacts: contacts,
        note: 'Real Telegram contacts retrieved from your account.'
      };
    } catch (error) {
      return {
        success: false,
        contacts: [],
        error: error.message
      };
    }
  }
}