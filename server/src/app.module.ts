import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MinigameStatModule } from './minigame-stat/minigame-stat.module';
import { RedisModule } from './redis/redis.module';
import { GameModule } from './game/game.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    RedisModule,
    UserModule,
    GameModule,
    MinigameStatModule,
  ],
})
export class AppModule {}
