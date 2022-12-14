import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TwoFactorAuthenticationUpdateDto } from '../../user/dto/2fa-update.dto';
import { ITwoFactorAuthenticationOtp } from '../2fa-otp.interface';
import { TwoFactorAuthenticationInfo } from '../2fa-info';

export class TwoFactorAuthenticationUpdateWithOtpDto
  extends TwoFactorAuthenticationUpdateDto
  implements ITwoFactorAuthenticationOtp
{
  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  info: TwoFactorAuthenticationInfo;
}
