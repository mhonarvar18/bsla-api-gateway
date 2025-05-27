import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
const chalk = require('chalk');
import { server } from './config/server.config';
import { ResponseInterceptor } from './shared/response.interceptor';
import { RpcExceptionFilter } from './shared/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors();

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(
    new RpcExceptionFilter()
  );

  await app.listen(process.env.PORT ?? 3000);
}


bootstrap().then(() => {
  console.log(
    chalk.whiteBright.italic.bold(
      `${chalk.bgGray(chalk.bgGreenBright.black.italic.bold('  AuthService is running on: '))} ${server.ip
      }:${server.port} => ${chalk.magenta(server.url)}\n`,
    ),
  );
});