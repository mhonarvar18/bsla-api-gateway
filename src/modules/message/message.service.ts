import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MessageService {
  constructor(@Inject('MESSAGE_SERVICE') private readonly client: ClientProxy) { }

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
