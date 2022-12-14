import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/http/guard/auth.guard';
import { UserService } from '../user/user.service';
import { BlockService } from './block.service';
@UseGuards(AuthGuard)
@Controller('block')
export class BlockController {
  constructor(
    private readonly blockService: BlockService,
    private readonly userService: UserService,
  ) {}

  @Get('/list')
  async getBlockList(@Req() req) {
    return this.blockService.getBlockList(req.user.user_id);
  }

  @Post('/:nickname')
  async blockUser(@Req() req, @Param('nickname') nickname) {
    const userProfile = await this.userService.getUserByNickname(nickname);
    return this.blockService.blockUser(req.user.user_id, userProfile.user_id);
  }

  @Delete('/:block_id')
  async cancelBlock(@Req() req, @Param('block_id') block_id) {
    return this.blockService.cancelBlock(block_id, req.user.user_id);
  }
}
