import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('accepts a valid service token and attaches service user context', async () => {
    const guard = new JwtAuthGuard(
      {
        verifyAsync: vi
          .fn()
          .mockResolvedValueOnce({
            sub: 'blogs-backend',
            role: 'service',
            iss: 'blogs-backend',
            aud: 'zeon-observability',
          })
          .mockResolvedValueOnce(null),
      } as any,
      {
        get: vi.fn((key: string) => {
          if (key === 'OBS_JWT_SECRET') return 'secret';
          if (key === 'OBS_INGEST_JWT_ISSUER') return 'blogs-backend';
          if (key === 'OBS_INGEST_JWT_AUDIENCE') return 'zeon-observability';
          return null;
        }),
      } as any,
    );

    const req: any = {
      header: vi.fn((name: string) =>
        name === 'authorization' ? 'Bearer token' : undefined,
      ),
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(req.user?.role).toBe('service');
  });

  it('rejects when no token is provided', async () => {
    const guard = new JwtAuthGuard(
      { verifyAsync: vi.fn() } as any,
      { get: vi.fn() } as any,
    );
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          header: vi.fn(() => undefined),
        }),
      }),
    } as any;

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
