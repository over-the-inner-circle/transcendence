import { IsIn } from 'class-validator';
import { TwoFactorAuthenticationType } from '../../user/user-info';

const types: TwoFactorAuthenticationType[] = ['google'];
export class TwoFactorAuthenticationGenerateDto {
  user_id: string;
  @IsIn(types)
  type: TwoFactorAuthenticationType;
}
