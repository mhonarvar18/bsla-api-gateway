import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './modules/auth/auth.module';
import { MessageModule } from './modules/message/message.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { WebsocketGateway } from './modules/websocket/websocket.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.AUTH_SERVICE_PORT) || 3001,
        },
      },
      {
        name: 'MESSAGE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MESSAGE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.MESSAGE_SERVICE_PORT) || 3002,
        },
      },
    ]),
    AuthModule,
    MessageModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'messages', method: RequestMethod.ALL });
  }
}
