import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

function classifyError(statusCode: number, exception: unknown): string {
  if (statusCode === 400) return 'validation';
  if (statusCode === 401) return 'auth';
  if (statusCode === 403) return 'forbidden';
  if (statusCode === 404) return 'not_found';
  if (statusCode === 409) return 'conflict';
  if (statusCode === 429) return 'throttled';
  if (statusCode >= 500) return 'internal';
  if (exception instanceof Error) return exception.name || 'error';
  return 'error';
}

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

    let message = 'Internal server error';
    if (isHttp) {
      const payload = exception.getResponse() as any;
      const raw = payload?.message ?? exception.message;
      if (Array.isArray(raw)) message = raw.join(', ');
      else if (typeof raw === 'string') message = raw;
      else message = 'Request failed';
    } else if (exception instanceof Error) {
      message = exception.message || message;
    }

    const errorCategory = classifyError(statusCode, exception);
    (res.locals as any).errorCategory = errorCategory;

    const requestId = (req as any).requestId as string | undefined;

    res.status(statusCode).json({
      error: {
        statusCode,
        category: errorCategory,
        message,
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }
}

