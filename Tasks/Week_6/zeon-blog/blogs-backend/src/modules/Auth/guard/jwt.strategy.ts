import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../types/current-user.type';
import { Request } from 'express';

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['access_token'] || null;
  }
  return null;
};

// Tells how to extract and convert into usable object for verification
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'dev-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUser> {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
