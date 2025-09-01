import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { createHash } from 'crypto';
import { User } from '../database/entities/user.entity';
import { Session } from '../database/entities/session.entity';
import { VerifySignatureDto } from './dto/auth.dto';

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