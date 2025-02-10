import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { RedisModule } from 'src/redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { GameGateway } from './game.gateway';

@Module({
  controllers: [GameController],
  providers: [GameGateway, GameService],
  exports: [GameService],
  imports: [RedisModule, ConfigModule],
})
export class GameModule {}
