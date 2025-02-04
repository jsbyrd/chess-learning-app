import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

// Todo: Put this in its own file
type GameMetaData = {
  gameId: string;
  numPlayers: number;
  p1: string | null;
  color1: string | null;
  p2: string | null;
  color2: string | null;
};

type GameUpdateState = {
  move: string;
};

type OnCreateGameMessage = {
  hasCreatedGame: boolean;
  gameId: string;
  msg: string | null;
};

type OnJoinGameMessage = {
  hasJoinedGame: boolean;
  gameId: string;
  msg: string | null;
};

type OnDisconnectMessage = {
  gameId: string;
  msg: string;
};

// TODO: Move all game logic into its own module. Probably won't do this until I have another use for websockets (maybe like a live leaderboard for minigames?)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MyGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  private server: Server;
  private redisPub: Redis;
  private redisSub: Redis;
  private playerGameMap: Map<string, string> = new Map();

  constructor(private readonly redis: RedisService) {
    // TODO: Remove hardcoded values with env variables
    this.redisPub = new Redis({
      port: 6379,
      host: 'localhost',
      username: '',
      password: 'myredispassword',
      db: 0,
    });
    this.redisSub = new Redis({
      port: 6379,
      host: 'localhost',
      username: '',
      password: 'myredispassword',
      db: 0,
    });
  }

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      console.log(`${socket.id} connected`);

      socket.on('disconnect', () => {
        this.handlePlayerDisconnect(socket);
      });
    });

    this.redisSub.on('message', (channel, message) => {
      const msg = JSON.parse(message);
      const eventType = msg.move ? 'onGameUpdate' : 'onGameStart';
      this.server.to(channel).emit(eventType, message);
    });
  }

  onModuleDestroy() {
    this.server.disconnectSockets();
  }

  @SubscribeMessage('createGame')
  async handleCreateGame(
    @MessageBody() data: { username: string; color: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const gameId = uuidv4();
    const channel = `game:${gameId}`;
    const color2 = data.color === 'white' ? 'black' : 'white';
    const metaData: GameMetaData = {
      gameId: gameId,
      numPlayers: 1,
      p1: data.username,
      color1: data.color,
      p2: null,
      color2: color2,
    };
    const metaDataStr = JSON.stringify(metaData);

    try {
      await socket.join(channel);
      await this.redis.set(channel, metaDataStr, 'EX', 1800);
      await this.redisSub.subscribe(channel);
      this.playerGameMap.set(socket.id, gameId);
    } catch (err) {
      this.playerGameMap.delete(socket.id);
      const createGameMsg: OnCreateGameMessage = {
        hasCreatedGame: false,
        gameId: gameId,
        msg: 'Something went wrong while trying to create the game. Please try again.',
      };
      socket.emit('onGameCreate', JSON.stringify(createGameMsg));
      return;
    }

    const createGameMsg: OnCreateGameMessage = {
      hasCreatedGame: true,
      gameId: gameId,
      msg: 'Game has been successfully created',
    };

    socket.emit('onGameCreate', JSON.stringify(createGameMsg));
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() data: { username: string; gameId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const channel = `game:${data.gameId}`;

    // Check redis for existing game
    const res = await this.redis.get(channel);

    if (!res) {
      const joinGameMsg: OnJoinGameMessage = {
        hasJoinedGame: false,
        gameId: data.gameId,
        msg: `Game with id ${data.gameId} doesn't exist.`,
      };
      socket.emit('onJoinGame', JSON.stringify(joinGameMsg));
      return;
    }

    let gameMetaData = JSON.parse(res) as GameMetaData;

    console.log(gameMetaData);

    // Check to see if game has already started
    if (gameMetaData.numPlayers >= 2) {
      const joinGameMsg: OnJoinGameMessage = {
        hasJoinedGame: false,
        gameId: data.gameId,
        msg: `Game with id ${data.gameId} already has two players.`,
      };
      socket.emit('onJoinGame', JSON.stringify(joinGameMsg));
      return;
    }

    // If game exists, update redis and publish message to both players to start the game
    gameMetaData.numPlayers++;
    gameMetaData.p2 = data.username;
    const metaDataStr = JSON.stringify(gameMetaData);
    this.playerGameMap.set(socket.id, data.gameId);
    await socket.join(channel);
    await this.redis.set(channel, metaDataStr, 'EX', 900);
    await this.redisPub.publish(channel, metaDataStr);
  }

  @SubscribeMessage('gameUpdate')
  async handleSendMessage(
    @MessageBody() data: { gameId: string; move: string },
  ) {
    const channel = `game:${data.gameId}`;

    // Publish message to the Redis channel
    const updateGameMsg: GameUpdateState = { move: data.move };
    await this.redisPub.publish(channel, JSON.stringify(updateGameMsg));
  }

  private async handlePlayerDisconnect(socket: Socket) {
    const gameId = this.playerGameMap.get(socket.id);
    console.log(this.playerGameMap);
    console.log(socket.rooms);

    console.log('disconnecting');

    // Check if disconnected socket was part of a game
    if (gameId) {
      console.log(`${socket.id} is disconnecting from game:${gameId}`);
      const channel = `game:${gameId}`;

      // Get game data from Redis
      const gameDataStr = await this.redis.get(channel);
      if (gameDataStr) {
        const gameData = JSON.parse(gameDataStr) as GameMetaData;

        // Delete game from Redis
        await this.redis.del(channel);

        // Remove socket from game tracking
        this.playerGameMap.delete(socket.id);

        // Notify other player about disconnection
        const disconnectMsg: OnDisconnectMessage = {
          gameId: gameId,
          msg: 'Your opponent has disconnected. The game has ended.',
        };

        this.server
          .to(channel)
          .emit('onPlayerDisconnect', JSON.stringify(disconnectMsg));
      }
    }
  }
}
