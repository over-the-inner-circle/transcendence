import { AuthGuard } from 'src/common/http/guard/auth.guard';
import { UserService } from './user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpCode,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CreateUserRequestDto } from './dto/user.request.dto';
import { TwoFactorAuthenticationInfo } from './user-info';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors';
import { AwsService } from '../common/aws/aws.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(201)
  @Post()
  async signUp(@Body() body: CreateUserRequestDto) {
    return this.userService.requestSignUp(body);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getMyProfile(@Req() req) {
    return this.userService.getUserById(req.user.user_id);
  }

  @HttpCode(204)
  @Delete()
  @UseGuards(AuthGuard)
  async deleteUser(@Req() req) {
    return this.userService.deleteById(req.user.user_id);
  }

  @Put('/nickname')
  @UseGuards(AuthGuard)
  async updateNickname(@Req() req, @Body('nickname') nickname: string) {
    return this.userService.updateNicknameById(req.user.user_id, nickname);
  }

  //NOTE: nullable (instead of delete)
  @Put('/prof-img')
  @UseInterceptors(FileInterceptor('prof_img')) // multipart/form-data's key
  @UseGuards(AuthGuard)
  async updateProfileImgById(
    @Req() req,
    // @Body('prof_img') profileImage: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updateProfImgById(req.user.user_id, file);
  }

  //NOTE: nullable (instead of delete)
  @Put('/2fa')
  @UseGuards(AuthGuard)
  async updateTwoFactorAuthenticationById(
    @Req() req,
    @Body() body: TwoFactorAuthenticationInfo,
  ) {
    return this.userService.updateTwoFactorAuthenticationById(
      req.user.user_id,
      body.type,
      body.key,
    );
  }

  @Get('/:nickname')
  // @UseGuards(AuthGuard)
  async getUserByNickname(@Param('nickname') nickname: string) {
    return this.userService.getUserByNickname(nickname);
  }

  @HttpCode(204)
  @Delete('/withdrawal')
  @UseGuards(AuthGuard)
  async deleteWithdrawalUser() {
    return this.userService.deleteOldWithdrawalUser();
  }
}
