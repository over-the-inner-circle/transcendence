import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/http/guard/auth.guard';
import { UserService } from 'src/user/user.service';
import { MatchHistoryService } from './match-history.service';

@Controller('history')
export class MatchHistoryController {
  constructor(
    private readonly matchHistoryService: MatchHistoryService,

    private readonly userService: UserService,
  ) {}

  @Get('/:nickname')
  @UseGuards(AuthGuard)
  async getMatchHistoryByNickname(@Param('nickname') nickname: string) {
    const userProfile = await this.userService.getUserByNickname(nickname);

    return this.matchHistoryService.getMatchHistoryById({
      user_id: userProfile.user_id,
      take: 5,
    });
  }
}
