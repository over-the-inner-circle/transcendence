import { IsNotEmpty, IsUUID } from 'class-validator';
import { TwoFactorAuthenticationType } from '../2fa-info';

export class TwoFactorAuthenticationGenerateDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  type: TwoFactorAuthenticationType;
}
