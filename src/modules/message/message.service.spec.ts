import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { ClientProxy } from '@nestjs/microservices';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { of } from 'rxjs';

describe('MessageService', () => {
  let service: MessageService;
  let client: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: 'MESSAGE_SERVICE',
          useValue: {
            send: jest.fn().mockReturnValue(of({ success: true })),
          },
        },
        {
          provide: WebsocketGateway,
          useValue: {
            sendMessageToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    client = module.get<ClientProxy>('MESSAGE_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send message using microservice client', async () => {
    const result = await service.sendMessage({ content: 'hello' });
    expect(result).toEqual({ success: true });
    expect(client.send).toHaveBeenCalledWith('send-message', { content: 'hello' });
  });
});
