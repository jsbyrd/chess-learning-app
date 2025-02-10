import { Test } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { GameService } from './game.service';

jest.mock('./game.service');

async function createNestApp(...gateways: any): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: [...gateways, GameService],
  }).compile();
  return testingModule.createNestApplication();
}

describe('GameGateway', () => {
  let gateway: GameGateway;
  let app: INestApplication;
  let client1: Socket;
  let client2: Socket;
  let gameService: jest.Mocked<GameService>;

  beforeAll(async () => {
    app = await createNestApp(GameGateway);
    gateway = app.get<GameGateway>(GameGateway);
    gameService = app.get<GameService>(GameService) as jest.Mocked<GameService>;

    client1 = io('http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
    client2 = io('http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    await app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  // it('should emit "onCreateGame" on "createGame" event', async () => {
  //   const mockResponse = {
  //     hasCreatedGame: true,
  //     gameId: '123',
  //     msg: 'Game created successfully',
  //   };

  //   gameService.createGame.mockResolvedValue(mockResponse);

  //   client1.connect();
  //   client1.emit('createGame', { username: 'player1', color: 'white' });

  //   await new Promise<void>((resolve) => {
  //     client1.on('onCreateGame', (data) => {
  //       expect(JSON.parse(data)).toEqual(mockResponse);
  //       resolve();
  //     });
  //   });

  //   client1.disconnect();
  // });

  // it('should emit "onJoinGame" on "joinGame" event', async () => {
  //   const mockResponse = {
  //     hasJoinedGame: true,
  //     gameId: '123',
  //     msg: 'Successfully joined the game',
  //   };

  //   gameService.joinGame.mockResolvedValue(mockResponse);

  //   client1.connect();
  //   client1.emit('joinGame', { username: 'player2', gameId: '123' });

  //   await new Promise<void>((resolve) => {
  //     client1.on('onJoinGame', (data) => {
  //       expect(JSON.parse(data)).toEqual(mockResponse);
  //       resolve();
  //     });
  //   });

  //   client1.disconnect();
  // });

  // it('should emit "onUpdateGame" to all players in the game', (done) => {
  //   const gameData = { username: 'player1', color: 'white' };

  //   console.log('0');
  //   client1.connect();
  //   client2.connect();

  //   client1.emit('createGame', gameData);

  //   client1.on('onCreateGame', (response) => {
  //     const parsedResponse = JSON.parse(response);
  //     const gameId = parsedResponse.gameId;
  //     const moveData = {
  //       gameId,
  //       move: 'e2e4',
  //       player: 'player1',
  //     };

  //     console.log('1');
  //     client2.emit('joinGame', { username: 'player2', gameId });

  //     client2.on('onJoinGame', () => {
  //       console.log('2');

  //       // Set up the listener for onUpdateGame BEFORE emitting updateGame
  //       client2.on('onUpdateGame', (updateResponse) => {
  //         console.log('4');
  //         const parsedUpdateResponse = JSON.parse(updateResponse);
  //         expect(parsedUpdateResponse).toEqual(moveData);

  //         // Ensure the test completes
  //         done();

  //         // Clean up connections
  //         client1.disconnect();
  //         client2.disconnect();
  //       });

  //       console.log('3');
  //       client1.emit('updateGame', moveData);
  //     });
  //   });
  // });

  // it('should emit "onPlayerDisconnect" to remaining players when a player leaves', (done) => {
  //   const gameData = {
  //     username: 'player1',
  //     color: 'white',
  //   };

  //   client1.connect();
  //   client2.connect();

  //   client1.emit('createGame', gameData);

  //   client1.on('onCreateGame', async (response) => {
  //     const parsedResponse = JSON.parse(response);
  //     const gameId = parsedResponse.gameId;

  //     client2.emit('joinGame', { username: 'player2', gameId });

  //     client2.on('onJoinGame', () => {
  //       client1.disconnect(); // Trigger player disconnection

  //       client2.on('onPlayerDisconnect', (disconnectResponse) => {
  //         const parsedDisconnectResponse = JSON.parse(disconnectResponse);
  //         expect(parsedDisconnectResponse.msg).toBe(
  //           'Your opponent has disconnected. The game has ended.',
  //         );
  //         done();
  //       });
  //     });
  //   });
  //   client1.disconnect();
  //   client2.disconnect();
  // });
});
