import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import type { Request, Response } from 'express';
import { MetricsService } from './metrics.service';

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

function normalizeRoute(req: Request, statusCode: number): string {
  const route = (req as any).route?.path;
  if (typeof route === 'string' && route.length > 0) {
    return route;
  }
  if (statusCode === 404) {
    return '__unmatched__';
  }
  return '__unknown_route__';
}

@Injectable()
export class RequestTimingInterceptor implements NestInterceptor {
  private readonly shouldLogRequests =
    process.env.BENCHMARK_REQUEST_LOGS === '1';

  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const start = process.hrtime.bigint();
    const ts = new Date().toISOString();
    const requestId = (req as any).requestId as string | undefined;
    const method = req.method;
    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
          const statusCode = res.statusCode;
          const route = normalizeRoute(req, statusCode);
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
          if (this.shouldLogRequests) {
            console.log(JSON.stringify({ type: 'request', ...metric }));
          }
        },
      }),
      catchError((err: unknown) => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const statusCode = err instanceof HttpException ? err.getStatus() : 500;
        const route = normalizeRoute(req, statusCode);
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
        if (this.shouldLogRequests) {
          console.log(JSON.stringify({ type: 'request', ...metric }));
        }

        return throwError(() => err);
      }),
    );
  }
}
