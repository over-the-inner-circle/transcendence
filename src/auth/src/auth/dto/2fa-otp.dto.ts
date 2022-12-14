import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ITwoFactorAuthenticationOtp } from '../2fa-otp.interface';

export class TwoFactorAuthenticationOtpDto
  implements ITwoFactorAuthenticationOtp
{
  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
