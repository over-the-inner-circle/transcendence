import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationRmqController } from './notification/controllers/notification.rmq.controller';
import { NotificationService } from './notification/services/notification.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { UserService } from './user/services/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: process.env.RMQ_HOST,
      exchanges: [
        {
          name: process.env.RMQ_USER_DIRECT,
          type: 'direct',
        },
        {
          name: process.env.RMQ_USER_TOPIC,
          type: 'topic',
        },
        {
          name: process.env.RMQ_NOTIFICATION_TOPIC,
          type: 'topic',
        },
        {
          name: process.env.RMQ_CHAT_TOPIC,
          type: 'topic',
        },
        {
          name: process.env.RMQ_GAME_TOPIC,
          type: 'topic',
        },
        {
          name: 'dm.t.x',
          type: 'topic',
        },
      ],
      enableControllerDiscovery: true,
      connectionInitOptions: { timeout: 20000 },
      defaultRpcTimeout: 20000,
    }),
  ],
  controllers: [NotificationRmqController],
  providers: [NotificationService, NotificationRmqController, UserService],
})
export class AppModule {}
