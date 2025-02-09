import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class GameService {
  constructor(private readonly redis: RedisService) {}

  async getOngoingGame(gameId: string) {
    const gameKey = `game:${gameId}`;
    const res = await this.redis.get(gameKey); // res is GameMetaData as string
    if (!res) throw new NotFoundException(`Game with ID ${gameId} not found`);
    return res;
  }
}
