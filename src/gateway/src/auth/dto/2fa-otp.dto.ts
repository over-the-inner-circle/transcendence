import { IsNotEmpty, IsString } from 'class-validator';
import { ITwoFactorAuthenticationOtp } from '../2fa-otp.interface';

export class TwoFactorAuthenticationOtpDto
  implements ITwoFactorAuthenticationOtp
{
  @IsString()
  @IsNotEmpty()
  otp: string;

  user_id: string;
}
