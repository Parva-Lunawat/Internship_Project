import { BadRequestException, type ArgumentsHost } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

import { HttpExceptionFilter } from './http-exception.filter';

function makeHost(req: Partial<Request>, res: Partial<Response>): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  } as unknown as ArgumentsHost;
}

describe('HttpExceptionFilter', () => {
  const emit = vi.fn();
  const status = vi.fn();
  const json = vi.fn();
  const response = { locals: {}, status, json } as unknown as Response;

  let filter: HttpExceptionFilter;

  beforeEach(() => {
    emit.mockReset();
    status.mockReset();
    json.mockReset();
    (response as any).locals = {};
    status.mockReturnValue(response);

    filter = new HttpExceptionFilter({
      emit,
    } as any);
  });

  it('classifies validation errors and forwards a structured log', () => {
    const req = {
      method: 'GET',
      originalUrl: '/api/v1/metrics/aggregate?groupBy=hour',
      header: vi.fn(() => undefined),
      requestId: 'req-1',
    } as unknown as Request;

    filter.catch(new BadRequestException('invalid input'), makeHost(req, response));

    expect(status).toHaveBeenCalledWith(400);
    expect(emit).toHaveBeenCalledWith(
      'logs',
      expect.objectContaining({
        requestId: 'req-1',
        statusCode: 400,
        logLevel: 'warn',
        payload: expect.objectContaining({ category: 'validation' }),
      }),
    );
  });

  it('does not leak unexpected error details to response payload', () => {
    const req = {
      method: 'GET',
      originalUrl: '/api/v1/logs',
      header: vi.fn(() => undefined),
      requestId: 'req-2',
    } as unknown as Request;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    filter.catch(new Error('db connection leaked'), makeHost(req, response));
    consoleSpy.mockRestore();

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Internal server error',
        }),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      'logs',
      expect.objectContaining({
        requestId: 'req-2',
        statusCode: 500,
        logLevel: 'error',
      }),
    );
  });
});

