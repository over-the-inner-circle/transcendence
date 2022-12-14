import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthHttpController } from './auth/controllers/auth.http.controller';
import { AuthService } from './auth/services/auth.service';
import { RedisModule } from './redis-module/redis.module';
import { UserService } from './user/services/user.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RmqResponseInterceptor } from './common/rmq/interceptors/rmq-response.interceptor';
import { AuthRmqController } from './auth/controllers/auth.rmq.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.jwt.key', '.oauth2.key', '.env'],
    }),
    PassportModule.register({}),
    JwtModule.register({}),
    RedisModule,
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: process.env.RMQ_HOST,
      exchanges: [
        {
          name: 'auth.d.x',
          type: 'direct',
        },
        {
          name: 'user.d.x',
          type: 'direct',
        },
      ],
      enableControllerDiscovery: true,
      connectionInitOptions: { timeout: 20000 },
      defaultRpcTimeout: 20000,
    }),
  ],
  providers: [
    RmqResponseInterceptor,
    AuthService,
    UserService,
    AuthRmqController,
  ],
  exports: [],
  controllers: [AuthHttpController, AuthRmqController],
})
export class AppModule {}
