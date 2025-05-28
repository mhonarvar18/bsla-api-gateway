// rpc-exception.filter.ts
import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const error: any = exception.getError();
    const statusCode =
      typeof error === 'object' && error?.statusCode ? error.statusCode : 400;
    const message =
      typeof error === 'object' && error?.message
        ? error.message
        : error || 'Internal RPC error';

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
