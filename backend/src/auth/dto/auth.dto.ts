import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class VerifySignatureDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'walletAddress must be a valid Ethereum address',
  })
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}