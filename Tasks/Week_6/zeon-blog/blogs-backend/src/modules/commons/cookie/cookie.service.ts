import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { User } from '../../Users/entities/user.entities';

export type CurrentUser = {
  id: string;
  email: string;
  role: string;
};
@Injectable()
export class CookieService {
  constructor(private readonly jwtService: JwtService) {}

  async setNewCookie(user: User, response: Response) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const expires = new Date();
    expires.setMilliseconds(expires.getMilliseconds() + 1000000000);

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
