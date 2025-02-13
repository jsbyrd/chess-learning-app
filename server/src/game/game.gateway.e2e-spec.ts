import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameModule } from './game.module';
import { io, Socket } from 'socket.io-client';

async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [GameModule], // Load the full module
  }).compile();

  return moduleFixture.createNestApplication();
}

describe('GameGateway (E2E)', () => {
  let app: INestApplication;
  let client1: Socket;
  let client2: Socket;

  beforeAll(async () => {
    app = await createTestApp();
    await app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
    client1.close();
    client2.close();
  });

  beforeEach(() => {
    client1 = io('http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket'],
    });
    client2 = io('http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket'],
    });
    client1.connect();
    client2.connect();
  });

  afterEach(() => {
    client1.disconnect();
    client2.disconnect();
  });

  it('should allow a player to create a game and receive confirmation', (done) => {
    client1.emit('createGame', { username: 'player1', color: 'white' });

    client1.on('onCreateGame', (data) => {
      expect(JSON.parse(data)).toMatchObject({
        hasCreatedGame: true,
        gameId: expect.any(String),
        msg: 'Game has been successfully created',
      });
      done();
    });
  });

  //   it('should allow a second player to join an existing game', (done) => {
  //     client1.connect();
  //     client2.connect();

  //     client1.emit('createGame', { username: 'player1', color: 'white' });

  //     client1.on('onCreateGame', (response) => {
  //       const { gameId } = JSON.parse(response);
  //       client2.emit('joinGame', { username: 'player2', gameId });

  //       client2.on('onJoinGame', (data) => {
  //         expect(JSON.parse(data)).toMatchObject({
  //           hasJoinedGame: true,
  //           gameId,
  //           msg: 'Successfully joined the game',
  //         });
  //         done();
  //       });
  //     });
  //   });

  //   it('should broadcast moves to all connected players', (done) => {
  //     client1.connect();
  //     client2.connect();

  //     client1.emit('createGame', { username: 'player1', color: 'white' });

  //     client1.on('onCreateGame', (response) => {
  //       const { gameId } = JSON.parse(response);

  //       client2.emit('joinGame', { username: 'player2', gameId });

  //       client2.on('onJoinGame', () => {
  //         const moveData = { gameId, move: 'e2e4', player: 'player1' };

  //         client2.on('onUpdateGame', (updateResponse) => {
  //           expect(JSON.parse(updateResponse)).toEqual(moveData);
  //           done();
  //         });

  //         client1.emit('updateGame', moveData);
  //       });
  //     });
  //   });

  //   it('should notify remaining player when an opponent disconnects', (done) => {
  //     client1.connect();
  //     client2.connect();

  //     client1.emit('createGame', { username: 'player1', color: 'white' });

  //     client1.on('onCreateGame', (response) => {
  //       const { gameId } = JSON.parse(response);

  //       client2.emit('joinGame', { username: 'player2', gameId });

  //       client2.on('onJoinGame', () => {
  //         client1.disconnect(); // Simulate player leaving

  //         client2.on('onPlayerDisconnect', (disconnectResponse) => {
  //           expect(JSON.parse(disconnectResponse)).toMatchObject({
  //             msg: 'Your opponent has disconnected. The game has ended.',
  //           });
  //           done();
  //         });
  //       });
  //     });
  //   });
});
