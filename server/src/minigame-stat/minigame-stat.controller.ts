import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guard';
import { MinigameStatService } from './minigame-stat.service';
import { CreateMinigameStatDto } from './minigame-stat.dto';
import { User } from '@prisma/client';

@Controller('minigame-stats')
export class MinigameStatController {
  constructor(private readonly service: MinigameStatService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Req() req: Request, @Body() dto: CreateMinigameStatDto) {
    return this.service.create(dto, req.user as User);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAllByUser(@Req() req: Request) {
    return this.service.findAllByUser(req.user as User);
  }
}
