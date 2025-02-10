import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guard';
import { GameService } from './game.service';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtGuard)
  @Get('/ongoing/:gameId')
  getOngoingGame(@Req() req: Request, @Param() params: any) {
    return this.gameService.getOngoingGame(params.gameId);
  }
}
