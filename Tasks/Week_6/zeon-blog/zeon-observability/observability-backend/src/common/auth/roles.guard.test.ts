import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';

import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  it('allows when role is included', () => {
    const reflector = {
      getAllAndOverride: vi.fn(() => ['admin']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const context = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'admin' } }),
      }),
    } as any;

    expect(guard.canActivate(context)).toBe(true);
  });
});
