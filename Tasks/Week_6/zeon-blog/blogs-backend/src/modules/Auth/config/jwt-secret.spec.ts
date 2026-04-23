import { ConfigService } from '@nestjs/config';
import { resolveJwtSecret } from './jwt-secret';

describe('resolveJwtSecret', () => {
  it('returns trimmed JWT secret from config', () => {
    const configService = {
      get: jest.fn().mockReturnValue('  my-secret  '),
    } as unknown as ConfigService;

    expect(resolveJwtSecret(configService)).toBe('my-secret');
  });

  it('throws when JWT secret is missing', () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    expect(() => resolveJwtSecret(configService)).toThrow(
      'JWT_SECRET is missing. Set JWT_SECRET in backend .env.',
    );
  });

  it('throws when JWT secret is empty after trim', () => {
    const configService = {
      get: jest.fn().mockReturnValue('   '),
    } as unknown as ConfigService;

    expect(() => resolveJwtSecret(configService)).toThrow(
      'JWT_SECRET is missing. Set JWT_SECRET in backend .env.',
    );
  });
});
