import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatService } from './chat/services/chat.service';
import { ChatRmqController } from './chat/controllers/chat.rmq.controller';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './common/entities/chat-room.entity';
import { User } from './common/entities/user.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ChatRoomMessage } from './common/entities/chat-room-message.entity';
import { ChatRoomUser } from './common/entities/chat-room-user.entity';
import { ChatRoomBanList } from './common/entities/chat-room-ban-list.entity';
import { ChatRoomMuteList } from './common/entities/chat-room-mute-list.entity';
import { DmService } from './dm/services/dm.service';
import { DM } from './common/entities/dm.entity';
import { DmRmqController } from './dm/controllers/dm.rmq.controller';
import { UserService } from './user/services/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: process.env.RMQ_HOST,
      exchanges: [
        {
          name: process.env.RMQ_CHAT_DIRECT,
          type: 'direct',
        },
        {
          name: process.env.RMQ_DM_DIRECT,
          type: 'direct',
        },
        {
          name: process.env.RMQ_USER_DIRECT,
          type: 'direct',
        },
        {
          name: process.env.RMQ_CHAT_TOPIC,
          type: 'topic',
        },
      ],
      enableControllerDiscovery: true,
      connectionInitOptions: { timeout: 20000 },
      defaultRpcTimeout: 20000,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT),
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      entities: [
        User,
        DM,
        ChatRoom,
        ChatRoomMessage,
        ChatRoomUser,
        ChatRoomBanList,
        ChatRoomMuteList,
      ],
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: true,
      poolSize: 20,
    }),
    TypeOrmModule.forFeature([
      User,
      DM,
      ChatRoom,
      ChatRoomMessage,
      ChatRoomUser,
      ChatRoomBanList,
      ChatRoomMuteList,
    ]),
  ],
  controllers: [ChatRmqController, DmRmqController],
  providers: [
    ChatService,
    ChatRmqController,
    DmService,
    DmRmqController,
    UserService,
  ],
})
export class AppModule {}
