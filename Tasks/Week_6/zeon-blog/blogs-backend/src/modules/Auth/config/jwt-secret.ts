import { ConfigService } from '@nestjs/config';

export function resolveJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET')?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET is missing. Set JWT_SECRET in backend .env.');
  }
  return secret;
}
