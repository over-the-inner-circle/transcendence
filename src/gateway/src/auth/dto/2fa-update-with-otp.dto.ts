import { IsNotEmpty, IsString } from 'class-validator';
import { TwoFactorAuthenticationInfo } from '../../user/user-info';
import { ITwoFactorAuthenticationOtp } from '../2fa-otp.interface';

export class TwoFactorAuthenticationUpdateWithOtpDto
  implements ITwoFactorAuthenticationOtp
{
  @IsString()
  @IsNotEmpty()
  otp: string;

  user_id: string;
  info: TwoFactorAuthenticationInfo;
}
