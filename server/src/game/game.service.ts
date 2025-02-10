import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { RedisService } from 'src/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import {
  OnCreateGameMessage,
  GameMetaData,
  OnJoinGameMessage,
  OnUpdateGameMessage,
  OnDisconnectMessage,
} from './game.types';

@Injectable()
export class GameService {
  private redisPub: Redis;
  private redisSub: Redis;
  private playerGameMap: Map<string, string> = new Map();

  constructor(
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {
    const redisConfig = {
      port: this.configService.get<number>('REDIS_PORT'),
      host: this.configService.get<string>('REDIS_HOST'),
      username: this.configService.get<string>('REDIS_USERNAME'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB'),
    };

    this.redisPub = new Redis(redisConfig);
    this.redisSub = new Redis(redisConfig);
  }

  async getOngoingGame(gameId: string) {
    const gameKey = `game:${gameId}`;
    const res = await this.redis.get(gameKey); // res is GameMetaData as string
    if (!res) throw new NotFoundException(`Game with ID ${gameId} not found`);
    return res;
  }

  async createGame(
    socket: Socket,
    data: { username: string; color: string },
  ): Promise<OnCreateGameMessage> {
    const gameId = uuidv4();
    const channel = `game:${gameId}`;
    const color2 = data.color === 'white' ? 'black' : 'white';
    const metaData: GameMetaData = {
      gameId,
      numPlayers: 1,
      p1: data.username,
      color1: data.color,
      p2: null,
      color2,
    };
    const metaDataStr = JSON.stringify(metaData);

    try {
      await socket.join(channel);
      await this.redis.set(channel, metaDataStr, 'EX', 1800);
      await this.redisSub.subscribe(channel);
      this.playerGameMap.set(socket.id, gameId);

      return {
        hasCreatedGame: true,
        gameId,
        msg: 'Game has been successfully created',
      };
    } catch (err) {
      this.playerGameMap.delete(socket.id);
      return {
        hasCreatedGame: false,
        gameId,
        msg: 'Something went wrong while trying to create the game. Please try again.',
      };
    }
  }

  async joinGame(
    socket: Socket,
    data: { username: string; gameId: string },
  ): Promise<OnJoinGameMessage> {
    const channel = `game:${data.gameId}`;
    const res = await this.redis.get(channel);

    if (!res) {
      return {
        hasJoinedGame: false,
        gameId: data.gameId,
        msg: `Game with id ${data.gameId} doesn't exist.`,
      };
    }

    const gameMetaData = JSON.parse(res) as GameMetaData;

    if (gameMetaData.numPlayers >= 2) {
      return {
        hasJoinedGame: false,
        gameId: data.gameId,
        msg: `Game with id ${data.gameId} already has two players.`,
      };
    }

    gameMetaData.numPlayers++;
    gameMetaData.p2 = data.username;
    const metaDataStr = JSON.stringify(gameMetaData);

    this.playerGameMap.set(socket.id, data.gameId);
    await socket.join(channel);
    // await this.redis.set(channel, metaDataStr, 'EX', 900);

    await this.redisPub.publish(channel, metaDataStr);

    return {
      hasJoinedGame: true,
      gameId: data.gameId,
      msg: 'Successfully joined the game',
    };
  }

  async updateGame(data: {
    gameId: string;
    move: string;
    player: string;
  }): Promise<void> {
    const channel = `game:${data.gameId}`;
    const updateGameMsg: OnUpdateGameMessage = {
      move: data.move,
      player: data.player,
    };
    await this.redisPub.publish(channel, JSON.stringify(updateGameMsg));
  }

  async handlePlayerDisconnect(socket: Socket, server: Server): Promise<void> {
    const gameId = this.playerGameMap.get(socket.id);

    if (gameId) {
      const channel = `game:${gameId}`;
      const gameDataStr = await this.redis.get(channel);

      if (gameDataStr) {
        await this.redis.del(channel);
        this.playerGameMap.delete(socket.id);

        const disconnectMsg: OnDisconnectMessage = {
          gameId,
          msg: 'Your opponent has disconnected. The game has ended.',
        };

        server
          .to(channel)
          .emit('onPlayerDisconnect', JSON.stringify(disconnectMsg));
      }
    }
  }

  setupRedisSubscription(server: Server): void {
    this.redisSub.on('message', (channel, message) => {
      const msg = JSON.parse(message);
      const eventType = msg.move ? 'onUpdateGame' : 'onStartGame';
      server.to(channel).emit(eventType, message);
    });
  }
}
