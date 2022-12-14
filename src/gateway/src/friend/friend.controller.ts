import { AuthGuard } from 'src/common/http/guard/auth.guard';
import { FriendService } from './friend.service';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../user/user.service';

@Controller('friend')
@UseGuards(AuthGuard)
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private readonly userService: UserService,
  ) {}

  @Get('/all')
  async getFriends(@Req() req) {
    return this.friendService.getFriends(req.user.user_id);
  }

  @HttpCode(204)
  @Delete('/:nickname')
  async deleteFriend(@Param('nickname') nickname: string, @Req() req) {
    const userProfile = await this.userService.getUserByNickname(nickname);
    return this.friendService.deleteFriend(
      req.user.user_id,
      userProfile.user_id,
    );
  }

  //request=======================================================================//

  @Get('/request/sent')
  async getRequestsSentList(@Req() req) {
    return this.friendService.getRequestsSentList(req.user.user_id);
  }

  @Get('/request/recv')
  async getRequestsRecvList(@Req() req) {
    return this.friendService.getRequestsRecvList(req.user.user_id);
  }

  @HttpCode(201)
  @Post('/request/:nickname')
  async makeRequest(@Param('nickname') nickname: string, @Req() req) {
    const userProfile = await this.userService.getUserByNickname(nickname);
    return this.friendService.makeRequest(
      req.user.user_id,
      userProfile.user_id,
    );
  }

  @HttpCode(204)
  @Delete('/request/:request_id')
  async cancelRequest(@Param('request_id') request_id, @Req() req) {
    return this.friendService.cancelRequest(request_id, req.user.user_id);
  }

  @HttpCode(201)
  @Post('/request/:request_id/accept')
  async acceptRequest(@Param('request_id') request_id, @Req() req) {
    return this.friendService.acceptRequest(request_id, req.user.user_id);
  }

  @HttpCode(204)
  @Post('/request/:request_id/reject')
  async rejectRequest(@Param('request_id') request_id, @Req() req) {
    return this.friendService.rejectRequest(request_id, req.user.user_id);
  }
}
