import { IsJWT } from 'class-validator';
export class VerifyAccessJwtRequestDto {
  @IsJWT()
  access_token: string;
}

export class VerifyRefreshJwtRequestDto {
  @IsJWT()
  refresh_token: string;
}

export class Tokens {
  @IsJWT()
  access_token: string;
  @IsJWT()
  refresh_token: string;
}
