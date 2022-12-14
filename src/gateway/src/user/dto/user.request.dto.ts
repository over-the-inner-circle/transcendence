import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  third_party_id: string;

  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsNotEmpty()
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  prof_img: string | null;
}
