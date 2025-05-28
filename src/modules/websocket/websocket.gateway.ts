import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { createClient, RedisClientType } from 'redis';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ cors: true })
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // userId to socket mapping
  private users = new Map<number, string>();

  private redisSubscriber: RedisClientType
  async afterInit(server: any) {
    this.redisSubscriber = createClient();
    await this.redisSubscriber.connect();

    await this.redisSubscriber.subscribe('message.sent', (messageStr) => {
      const message = JSON.parse(messageStr);
      this.server.to(`user-${message.receiverId}`).emit('newMessage', message)
    });

    await this.redisSubscriber.subscribe('message.read', (messageStr) => {
      const payload = JSON.parse(messageStr);
      this.server.to(`user-${payload.senderId}`).emit('messageRead', {
        messageId: payload.messageId,
        readerId: payload.readerId,
      });
    });
  }


  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.replace('Bearer', '');
      if (!token) {
        client.disconnect();
        return;
      }

      const payload: any = jwt.verify(token, process.env.JWT_SECRET);
      const userId = payload.userId;
      client.join(`user-${userId}`);
      (client as any).userId = userId;
      console.log(`User ${userId} connected`);

    } catch (error) {
      console.error('invalid token:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.users.entries()].find(([_, id]) => id === client.id)?.[0];
    if (userId) {
      this.users.delete(userId);
      console.log(`❌ User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    client.emit('pong', { message: 'pong' });
  }

  @SubscribeMessage('message.read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: number, senderId: number }
  ) {
    const redisPublisher = createClient();
    await redisPublisher.connect();

    const payload = {
      messageId: data.messageId,
      senderId: data.senderId,
      readerId: (client as any).userId,
    };

    await redisPublisher.publish('message.read', JSON.stringify(payload));
    await redisPublisher.disconnect();
  }


  sendMessageToUser(userId: number, message: any) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('new_message', message);
    }
  }
}
