import { BlockController } from './block/block.controller';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { FriendService } from './friend/friend.service';
import { UserService } from './user/user.service';
import { FriendController } from './friend/friend.controller';
import { UserController } from './user/user.controller';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { TestController } from './test.controller';
import { BlockService } from './block/block.service';
import { ChatService } from './chat/services/chat.service';
import { ChatController } from './chat/controllers/chat.controller';
import { MatchHistoryController } from './match-history/match-history.controller';
import { MatchHistoryService } from './match-history/match-history.service';
import { AwsModule } from './common/aws/aws.module';
import { AwsService } from './common/aws/aws.service';
import { DmService } from './dm/services/dm.service';
import { DmController } from './dm/controllers/dm.controller';
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: process.env.RMQ_USER_DIRECT,
          type: 'direct',
        },
        {
          name: process.env.RMQ_MATCH_HISTORY_DIRECT,
          type: 'direct',
        },
      ],
      uri: 'amqp://guest:guest@rabbitmq:5672',
      connectionInitOptions: { timeout: 20000 },
      defaultRpcTimeout: 20000,
    }),
    AwsModule,
  ],
  controllers: [
    AuthController,
    UserController,
    AuthController,
    FriendController,
    BlockController,
    TestController,
    ChatController,
    MatchHistoryController,
    DmController,
    GameController,
  ],
  providers: [
    AuthService,
    AwsService,
    UserService,
    FriendService,
    BlockService,
    ChatService,
    MatchHistoryService,
    DmService,
    GameService,
  ],
})
export class AppModule {}
