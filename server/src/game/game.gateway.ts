import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  private server: Server;

  constructor(private readonly gameService: GameService) {}

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      socket.on('disconnect', () => {
        this.gameService.handlePlayerDisconnect(socket, this.server);
      });
    });

    this.gameService.setupRedisSubscription(this.server);
  }

  onModuleDestroy() {
    this.server.disconnectSockets();
  }

  @SubscribeMessage('createGame')
  async handleCreateGame(
    @MessageBody() data: { username: string; color: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const response = await this.gameService.createGame(socket, data);
    socket.emit('onCreateGame', JSON.stringify(response));
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() data: { username: string; gameId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const response = await this.gameService.joinGame(socket, data);
    socket.emit('onJoinGame', JSON.stringify(response));
  }

  @SubscribeMessage('updateGame')
  async handleSendMessage(
    @MessageBody() data: { gameId: string; move: string; player: string },
  ) {
    await this.gameService.updateGame(data);
  }
}
