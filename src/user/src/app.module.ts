import { FriendService } from './friend/friend.service';
import { UserService } from './user/user.service';
import { FriendController } from './friend/friend.controller';
import { UserController } from './user/user.controller';
import { FriendRequest } from './common/entities/Friend_request';
import { Friend } from './common/entities/Friend';
import { Block } from './common/entities/Block';
import { User } from './common/entities/User';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { BlockController } from './block/block.controller';
import { BlockService } from './block/block.service';
import { RedisModule } from './redis-module/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Block, Friend, FriendRequest],
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    TypeOrmModule.forFeature([User, FriendRequest, Friend, Block]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: process.env.RMQ_USER_DIRECT,
          type: 'direct',
        },
        {
          name: process.env.RMQ_STATE_TOPIC,
          type: 'topic',
        },
      ],
      uri: process.env.RMQ_URI,
      enableControllerDiscovery: true,
      connectionInitOptions: { timeout: 20000 },
      defaultRpcTimeout: 20000,
    }),
    RedisModule,
  ],
  controllers: [UserController, FriendController, BlockController],
  providers: [UserController, UserService, FriendService, BlockService],
})
export class AppModule {}
