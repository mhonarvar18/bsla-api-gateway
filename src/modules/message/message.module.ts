import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WebsocketModule } from '../websocket/websocket.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MESSAGE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MESSAGE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.MESSAGE_SERVICE_PORT) || 3002,
        },
      },
    ]),
    ConfigModule,
    WebsocketModule,
    RedisModule,
  ],
  providers: [MessageService, JwtAuthGuard],
  controllers: [MessageController],
})
export class MessageModule { }
