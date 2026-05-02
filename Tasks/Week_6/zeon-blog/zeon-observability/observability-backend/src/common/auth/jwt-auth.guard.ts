import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import type { AuthContext } from './auth-context.type';

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
  iss?: string;
  aud?: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private extractBearerToken(req: Request): string | null {
    const value = req.header('authorization');
    if (!value) return null;
    const [scheme, token] = value.split(' ');
    if (!scheme || !token || scheme.toLowerCase() !== 'bearer') return null;
    return token.trim();
  }

  private async verifyServiceToken(token: string): Promise<JwtPayload | null> {
    const secret = this.configService.get<string>('OBS_JWT_SECRET');
    if (!secret) return null;

    try {
      const issuer =
        this.configService.get<string>('OBS_INGEST_JWT_ISSUER') ||
        'blogs-backend';
      const audience =
        this.configService.get<string>('OBS_INGEST_JWT_AUDIENCE') ||
        'zeon-observability';

      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
        issuer,
        audience,
      });
    } catch {
      return null;
    }
  }

  private async verifyMainToken(token: string): Promise<JwtPayload | null> {
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      this.configService.get<string>('MAIN_JWT_SECRET');
    if (!secret) return null;

    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, { secret });
    } catch {
      return null;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: AuthContext }>();
    const token = this.extractBearerToken(req);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const servicePayload = await this.verifyServiceToken(token);
    if (servicePayload?.role === 'service') {
      req.user = {
        sub: servicePayload.sub,
        email: servicePayload.email,
        role: 'service',
        iss: servicePayload.iss,
        aud: servicePayload.aud,
        tokenType: 'service',
      };
      return true;
    }

    const mainPayload = await this.verifyMainToken(token);
    if (!mainPayload?.role) {
      throw new UnauthorizedException('Invalid token');
    }

    req.user = {
      sub: mainPayload.sub,
      email: mainPayload.email,
      role: mainPayload.role as AuthContext['role'],
      iss: mainPayload.iss,
      aud: mainPayload.aud,
      tokenType: 'main',
    };
    return true;
  }
}
