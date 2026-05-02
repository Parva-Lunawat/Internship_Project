import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const requestId = (req as any).requestId as string | undefined;

    let message = 'Internal server error';
    if (isHttp) {
      const response = exception.getResponse() as
        | { message?: unknown }
        | string;
      const raw =
        typeof response === 'string' ? response : response?.message ?? message;
      if (Array.isArray(raw)) message = raw.join(', ');
      else if (typeof raw === 'string') message = raw;
    }

    if (!isHttp) {
      console.error(
        JSON.stringify({
          type: 'unexpected_error',
          requestId,
          path: req.originalUrl,
          method: req.method,
          timestamp: new Date().toISOString(),
          error:
            exception instanceof Error
              ? {
                  name: exception.name,
                  message: exception.message,
                  stack: exception.stack,
                }
              : String(exception),
        }),
      );
    }

    res.status(statusCode).json({
      error: {
        statusCode,
        message,
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }
}
