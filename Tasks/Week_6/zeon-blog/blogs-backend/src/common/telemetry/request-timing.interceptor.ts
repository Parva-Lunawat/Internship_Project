import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';
import { MetricsService } from './metrics.service';

function toRouteLabel(req: Request): string {
  // Prefer Express route pattern when available (more stable than raw URL)
  const route = (req as any).route?.path;
  if (typeof route === 'string') return route;
  return req.path;
}

function classifyByStatus(statusCode: number): string {
  if (statusCode === 400) return 'validation';
  if (statusCode === 401) return 'auth';
  if (statusCode === 403) return 'forbidden';
  if (statusCode === 404) return 'not_found';
  if (statusCode === 409) return 'conflict';
  if (statusCode === 429) return 'throttled';
  if (statusCode >= 500) return 'internal';
  return 'error';
}

@Injectable()
export class RequestTimingInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const start = process.hrtime.bigint();
    const ts = new Date().toISOString();
    const requestId = (req as any).requestId as string | undefined;
    const method = req.method;
    const route = toRouteLabel(req);

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
          const statusCode = res.statusCode;
          const errorCategory =
            ((res.locals as any)?.errorCategory as string | undefined) ??
            (statusCode >= 400 ? classifyByStatus(statusCode) : undefined);

          const metric = {
            ts,
            method,
            route,
            statusCode,
            durationMs,
            requestId,
            errorCategory,
          };

          this.metrics.recordRequest(metric);
          // Machine-readable single-line JSON log for benchmarks.
          // eslint-disable-next-line no-console
          console.log(JSON.stringify({ type: 'request', ...metric }));
        },
        error: () => {
          const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
          const statusCode = res.statusCode || 500;
          const errorCategory =
            ((res.locals as any)?.errorCategory as string | undefined) ??
            classifyByStatus(statusCode);

          const metric = {
            ts,
            method,
            route,
            statusCode,
            durationMs,
            requestId,
            errorCategory,
          };

          this.metrics.recordRequest(metric);
          // eslint-disable-next-line no-console
          console.log(JSON.stringify({ type: 'request', ...metric }));
        },
      }),
    );
  }
}
