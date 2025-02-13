import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import Redis from 'ioredis';

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  publish: jest.fn(),
  subscribe: jest.fn(),
};

describe('GameService', () => {
  let gameService: GameService;
  let redisService: RedisService;
  let configService: ConfigService;
  let socket: jest.Mocked<Socket>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const mockConfig = {
                REDIS_PORT: 6379,
                REDIS_HOST: 'localhost',
                REDIS_USERNAME: '',
                REDIS_PASSWORD: '',
                REDIS_DB: 0,
              };
              return mockConfig[key];
            }),
          },
        },
      ],
    }).compile();

    gameService = module.get<GameService>(GameService);
    redisService = module.get<RedisService>(RedisService);
    configService = module.get<ConfigService>(ConfigService);
    socket = {
      join: jest.fn(),
      id: 'socket-id-123',
    } as unknown as jest.Mocked<Socket>;
  });

  it('should be defined', () => {
    expect(gameService).toBeDefined();
  });

  it('should call socket.join when createGame is called', async () => {
    const gameData = { username: 'player1', color: 'white' };

    const response = await gameService.createGame(socket, gameData);

    expect(socket.join).toHaveBeenCalledTimes(1);
    expect(socket.join).toHaveBeenCalledWith(expect.stringContaining('game:'));
    expect(response.hasCreatedGame).toBe(true);
    expect(response.msg).toContain('successfully created');
  });

  it('should call socket.join when joinGame is called with valid gameId', async () => {
    const gameData = { username: 'player2', gameId: 'game-123' };
    redisService.get = jest.fn().mockResolvedValue(
      JSON.stringify({
        gameId: gameData.gameId,
        numPlayers: 1,
        p1: 'player1',
        color1: 'white',
        p2: null,
        color2: 'black',
      }),
    );

    const response = await gameService.joinGame(socket, gameData);

    expect(socket.join).toHaveBeenCalledTimes(1);
    expect(socket.join).toHaveBeenCalledWith('game:game-123');
    expect(response.hasJoinedGame).toBe(true);
  });

  it('should return an error if gameId is invalid in joinGame', async () => {
    redisService.get = jest.fn().mockResolvedValue(null);

    const response = await gameService.joinGame(socket, {
      username: 'player2',
      gameId: 'invalid-game',
    });

    expect(response.hasJoinedGame).toBe(false);
    expect(response.msg).toContain("doesn't exist");
  });

  it('should publish an update when updateGame is called', async () => {
    const redisPubMock = {
      publish: jest.fn(),
    };
    gameService['redisPub'] = redisPubMock as unknown as Redis;

    const gameUpdate = { gameId: 'game-123', move: 'e2e4', player: 'player1' };

    await gameService.updateGame(gameUpdate);

    expect(redisPubMock.publish).toHaveBeenCalledTimes(1);
    expect(redisPubMock.publish).toHaveBeenCalledWith(
      'game:game-123',
      JSON.stringify({ move: 'e2e4', player: 'player1' }),
    );
  });
});
