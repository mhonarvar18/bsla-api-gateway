import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    let message = 'Internal server error';

    if (exception instanceof BadRequestException) {
      const res = exception.getResponse();
      message = (res as any).message || message;
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message = (res as any).message || exception.message || message;
    } else if (typeof exception === 'object' && exception.message) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
