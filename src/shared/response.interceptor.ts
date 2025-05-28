import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: T | ApiResponse<T>) => {
        if (isApiResponse<T>(data)) {
          return data;
        }

        const extractedData = (data as any)?.data ?? data;
        const extractedPagination = (data as any)?.pagination;

        return {
          statusCode: 200,
          message: 'Request successful',
          data: extractedData as T,
          pagination: extractedPagination,
        };
      }),
    );
  }
}

function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return obj && typeof obj === 'object' && 'data' in obj && 'statusCode' in obj;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  pagination?: any;
}
