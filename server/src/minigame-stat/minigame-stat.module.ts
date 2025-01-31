import { Module } from '@nestjs/common';
import { MinigameStatService } from './minigame-stat.service';
import { MinigameStatController } from './minigame-stat.controller';

@Module({
  controllers: [MinigameStatController],
  providers: [MinigameStatService],
  exports: [MinigameStatService],
})
export class MinigameStatModule {}
