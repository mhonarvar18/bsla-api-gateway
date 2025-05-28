import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class MessageService {
  constructor(
    @Inject('MESSAGE_SERVICE') private readonly client: ClientProxy,
    private readonly websocketGateway: WebsocketGateway,
  ) { }

  sendMessage(data: any) {
    return lastValueFrom(this.client.send('send-message', data));
  }

  getConversation(data: { userId: number; peerId: number }) {
    return lastValueFrom(this.client.send('get-conversation', data));
  }

  markAsRead(messageId: number) {
    return lastValueFrom(this.client.send('mark-as-read', { messageId }));
  }
}
