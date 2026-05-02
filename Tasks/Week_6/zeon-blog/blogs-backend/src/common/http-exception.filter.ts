import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ObservabilityForwarderService } from './telemetry/observability-forwarder.service';

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
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly forwarder: ObservabilityForwarderService) {}

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
    }

    const errorCategory = classifyError(statusCode, exception);
    (res.locals as any).errorCategory = errorCategory;

    const requestId = (req as any).requestId as string | undefined;
    if (!isHttp) {
      const logPayload = {
        type: 'unexpected_error',
        requestId,
        method: req.method,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        error:
          exception instanceof Error
            ? {
                name: exception.name,
                message: exception.message,
                stack: exception.stack,
              }
            : String(exception),
      };

      console.error(JSON.stringify(logPayload));
    }
    this.forwarder.emit('logs', {
      requestId,
      traceId: req.header('x-trace-id') || requestId,
      endpoint: req.originalUrl,
      method: req.method,
      statusCode,
      timestamp: new Date().toISOString(),
      logLevel: statusCode >= 500 ? 'error' : 'warn',
      userId: (req as any).user?.id as string | undefined,
      message,
      payload: {
        category: errorCategory,
        isHttp,
        exceptionName: exception instanceof Error ? exception.name : undefined,
      },
    });

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
