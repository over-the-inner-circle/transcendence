import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TwoFactorAuthenticationOtpDto } from './dto/2fa-otp.dto';
import { TwoFactorAuthenticationUpdateWithOtpDto } from './dto/2fa-update-with-otp.dto';
import * as qrcode from 'qrcode';
import { AuthGuard, PendingAuthGuard } from '../common/http/guard/auth.guard';
import { TwoFactorAuthenticationGenerateDto } from './dto/2fa-generate.dto';

type Provider = 'kakao' | '42' | 'google';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //TODO: param validation
  @Post('/oauth2/:provider')
  async oauth(@Body('code') code, @Param('provider') provider: Provider) {
    return this.authService.requestSignIn(provider, code); // 가입되어 있다면 {access_token, refresth_token} (jwt), 아닐 시 RmqError(404)가 리턴됩니다
  }

  @Post('/refresh')
  async refresh(@Body('refresh_token') token) {
    return this.authService.requestRefresh(token);
  }

  //======== 2fa

  @UseGuards(PendingAuthGuard)
  @Post('/2fa/verify')
  async verify2FA(@Req() req, @Body() body: TwoFactorAuthenticationOtpDto) {
    return this.authService.requestVerify2FA({
      user_id: req.user.user_id,
      otp: body.otp,
    });
  }

  @UseGuards(AuthGuard)
  @Put('/2fa/enable')
  async enable2FA(@Req() req, @Body() body: TwoFactorAuthenticationOtpDto) {
    return this.authService.requestEnable2FA({
      user_id: req.user.user_id,
      otp: body.otp,
    });
  }

  @UseGuards(AuthGuard)
  @Put('/2fa/disable')
  async disable2FA(@Req() req, @Body() body: TwoFactorAuthenticationOtpDto) {
    return this.authService.requestDisable2FA({
      user_id: req.user.user_id,
      otp: body.otp,
    });
  }

  @UseGuards(AuthGuard)
  @Put('/2fa/info')
  async update2FAInfo(
    @Req() req,
    @Body() body: TwoFactorAuthenticationUpdateWithOtpDto,
  ) {
    return this.authService.requestUpdate2FAInfo({
      user_id: req.user.user_id,
      otp: body.otp,
      info: body.info,
    });
  }

  @UseGuards(AuthGuard)
  @Delete('/2fa/info')
  async delete2FAInfo(@Req() req, @Body() body: TwoFactorAuthenticationOtpDto) {
    return this.authService.requestDelete2FAInfo({
      user_id: req.user.user_id,
      otp: body.otp,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/2fa/generate')
  async generateSecret(
    @Req() req,
    @Body() body: TwoFactorAuthenticationGenerateDto,
  ) {
    //TODO : 2FA type , gen result typing
    return await this.authService.requestGenerate2FASecret({
      type: body.type,
      user_id: req.user.user_id,
    });
  }
}
