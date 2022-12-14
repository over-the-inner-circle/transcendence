import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/http/guard/auth.guard';
import { UserService } from '../../user/user.service';
import { DmService } from '../services/dm.service';

@UseGuards(AuthGuard)
@Controller('dm')
export class DmController {
  constructor(
    private readonly dmService: DmService,
    private readonly userService: UserService,
  ) {}

  @Get(':receiverName/messages')
  async getAllMessages(
    @Req() req,
    @Param('receiverName') receiverName: string,
  ) {
    const receiver = await this.userService.getUserByNickname(receiverName);
    return this.dmService.getAllMessages(req.user.user_id, receiver.user_id);
  }
}
