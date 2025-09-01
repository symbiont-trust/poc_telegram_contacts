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