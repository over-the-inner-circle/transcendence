import { MatchHistoryController } from './match-history/match-history.controller';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { GameInfo } from './common/entities/game-info.entity';
import { GameResult } from './common/entities/game-result.entity';
import { RankHistory } from './common/entities/rank-history';
import { User } from './common/entities/user.entity';
import { MatchHistoryService } from './match-history/match-history.service';

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
      entities: [User, GameInfo, GameResult, RankHistory],
      namingStrategy: new SnakeNamingStrategy(),
      poolSize: 20,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, GameInfo, GameResult, RankHistory]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'match-history.d.x',
          type: 'direct',
        },
        {
          name: 'user.d.x',
          type: 'direct',
        },
      ],
      uri: process.env.RMQ_URI,
      enableControllerDiscovery: true,
      connectionInitOptions: { timeout: 20000 },
      defaultRpcTimeout: 20000,
    }),
  ],
  controllers: [MatchHistoryController],
  providers: [MatchHistoryService],
})
export class AppModule {}
