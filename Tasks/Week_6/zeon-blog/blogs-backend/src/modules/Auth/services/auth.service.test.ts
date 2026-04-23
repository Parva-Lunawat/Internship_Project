import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserRole } from 'src/modules/Users/entities/user.entities';

type MockRepo = {
  findOne: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
};

type MockJwt = {
  sign: ReturnType<typeof vi.fn>;
};

describe('AuthService (vitest)', () => {
  let service: AuthService;
  let userRepository: MockRepo;
  let jwtService: MockJwt;

  beforeEach(() => {
    userRepository = {
      findOne: vi.fn(),
      create: vi.fn((input) => input),
      save: vi.fn(async (input) => ({
        id: 'user-1',
        createdAt: new Date('2026-04-10T00:00:00.000Z'),
        updatedAt: new Date('2026-04-10T00:00:00.000Z'),
        ...input,
      })),
    };
    jwtService = {
      sign: vi.fn(() => 'signed-token'),
    };

    service = new AuthService(userRepository as any, jwtService as any);
  });

  it('signs up a user, hashes password, and returns auth payload', async () => {
    userRepository.findOne.mockResolvedValueOnce(null);

    const result = await service.signup({
      name: '  Parva  ',
      email: '  PARVA@example.com ',
      password: 'Codal@123',
      confirmPassword: 'Codal@123',
    });

    expect(result.accessToken).toBe('signed-token');
    expect(result.user.email).toBe('parva@example.com');
    expect(result.user.name).toBe('Parva');
    expect(result.user.role).toBe(UserRole.READER);

    const createArg = userRepository.create.mock.calls[0][0];
    expect(createArg.passwordHash).not.toBe('Codal@123');
    await expect(
      bcrypt.compare('Codal@123', createArg.passwordHash),
    ).resolves.toBe(true);
  });

  it('rejects duplicate signup email', async () => {
    userRepository.findOne.mockResolvedValueOnce({
      id: 'existing-user',
      email: 'parva@example.com',
    });

    await expect(
      service.signup({
        name: 'Parva',
        email: 'parva@example.com',
        password: 'Codal@123',
        confirmPassword: 'Codal@123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('logs in with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('Codal@123', 10);
    userRepository.findOne.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Parva',
      email: 'parva@example.com',
      role: UserRole.WRITER,
      avatar: null,
      isProfileComplete: false,
      passwordHash,
    });

    const result = await service.login({
      email: ' Parva@example.com ',
      password: 'Codal@123',
    });

    expect(result.accessToken).toBe('signed-token');
    expect(result.user.email).toBe('parva@example.com');
    expect(result.user.role).toBe(UserRole.WRITER);
  });

  it('rejects login when user does not exist', async () => {
    userRepository.findOne.mockResolvedValueOnce(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'Codal@123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login when password is invalid', async () => {
    const passwordHash = await bcrypt.hash('CorrectPassword@123', 10);
    userRepository.findOne.mockResolvedValueOnce({
      id: 'user-1',
      name: 'Parva',
      email: 'parva@example.com',
      role: UserRole.WRITER,
      avatar: null,
      isProfileComplete: false,
      passwordHash,
    });

    await expect(
      service.login({
        email: 'parva@example.com',
        password: 'WrongPassword@123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
