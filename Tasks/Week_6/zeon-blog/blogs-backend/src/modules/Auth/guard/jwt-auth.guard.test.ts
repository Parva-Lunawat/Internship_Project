import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { JwtAuthGuard } from './jwt-auth.guard';

function makeExecutionContext(request: Record<string, any>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('JwtAuthGuard (vitest)', () => {
  it('rejects requests when access_token cookie is missing', () => {
    const guard = new JwtAuthGuard();
    const ctx = makeExecutionContext({ cookies: {} });

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
