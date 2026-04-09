import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../Users/entities/user.entities';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { UserRole } from 'src/modules/Users/entities/user.entities';

import type { CurrentUser } from '../types/current-user.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Helper
  private buildAuthMessage(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
    };
  }

  // Services
  async signup(dto: SignupDto) {
    const { name, email, password, confirmPassword } = dto;
    const processedEmail = email.trim().toLowerCase();
    const processedName = name.trim();
    if (password !== confirmPassword)
      throw new BadRequestException(
        'Password and Confirm password must match.',
      );
    const existingUser = await this.userRepository.findOne({
      where: { email: processedEmail },
    });
    if (existingUser) throw new BadRequestException('User already exists.');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      name: processedName,
      email: processedEmail,
      passwordHash: passwordHash,
      avatar: null,
      isProfileComplete: false,
      // role: dto.role ?? UserRole.WRITER,
    });
    const savedUser = await this.userRepository.save(user);
    return this.buildAuthMessage(savedUser);
  }
  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (!user) throw new UnauthorizedException('Invalid email or password.');
    const passwordMatched = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatched)
      throw new UnauthorizedException('Invalid email or password.');
    return this.buildAuthMessage(user);
  }
  async self(currentUser: CurrentUser) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser.id },
    });
    if (!user) throw new UnauthorizedException('User not found.');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isProfileComplete: user.isProfileComplete,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
