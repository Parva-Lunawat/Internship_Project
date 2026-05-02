import {
  type CallHandler,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { lastValueFrom, of, throwError } from 'rxjs';
import type { Request, Response } from 'express';

import { MetricsService } from './metrics.service';
import { ObservabilityForwarderService } from './observability-forwarder.service';
import { RequestTimingInterceptor } from './request-timing.interceptor';

function makeContext(req: Partial<Request>, res: Partial<Response>) {
  return {
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  } as unknown as ExecutionContext;
}

describe('RequestTimingInterceptor', () => {
  it('records + forwards metrics/traces on success', async () => {
    const metrics = { recordRequest: vi.fn() } as unknown as MetricsService;
    const forwarder = { emit: vi.fn() } as unknown as ObservabilityForwarderService;
    const interceptor = new RequestTimingInterceptor(metrics, forwarder);

    const req = {
      method: 'GET',
      route: { path: '/blogs' },
      header: vi.fn(() => undefined),
      requestId: 'trace-1',
    } as unknown as Request;
    const res = { statusCode: 200, locals: {} } as unknown as Response;
    const next = { handle: () => of({ ok: true }) } as CallHandler;

    await lastValueFrom(interceptor.intercept(makeContext(req, res), next));

    expect((metrics as any).recordRequest).toHaveBeenCalledTimes(1);
    expect((forwarder as any).emit).toHaveBeenCalledWith(
      'metrics',
      expect.objectContaining({
        requestId: 'trace-1',
        endpoint: '/blogs',
        statusCode: 200,
      }),
    );
    expect((forwarder as any).emit).toHaveBeenCalledWith(
      'traces',
      expect.objectContaining({
        requestId: 'trace-1',
        endpoint: '/blogs',
        statusCode: 200,
      }),
    );
  });

  it('records + forwards classified failure metrics on exception', async () => {
    const metrics = { recordRequest: vi.fn() } as unknown as MetricsService;
    const forwarder = { emit: vi.fn() } as unknown as ObservabilityForwarderService;
    const interceptor = new RequestTimingInterceptor(metrics, forwarder);

    const req = {
      method: 'POST',
      route: { path: '/blogs' },
      header: vi.fn(() => undefined),
      requestId: 'trace-2',
    } as unknown as Request;
    const res = { statusCode: 200, locals: {} } as unknown as Response;
    const next = {
      handle: () => throwError(() => new UnauthorizedException('bad token')),
    } as CallHandler;

    await expect(
      lastValueFrom(interceptor.intercept(makeContext(req, res), next)),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect((metrics as any).recordRequest).toHaveBeenCalledTimes(1);
    expect((forwarder as any).emit).toHaveBeenCalledWith(
      'metrics',
      expect.objectContaining({
        requestId: 'trace-2',
        endpoint: '/blogs',
        statusCode: 401,
        payload: expect.objectContaining({ errorCategory: 'auth' }),
      }),
    );
  });
});

