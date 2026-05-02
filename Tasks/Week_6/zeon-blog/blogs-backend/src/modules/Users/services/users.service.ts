import {
  ForbiddenException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../entities/user.entities';
import { UpdateUserProfileDto } from '../dtos/update-user-profile.dto';
import { QueryUsersDto } from '../dtos/query-users.dto';
import type { CurrentUser } from '../../Auth/types/current-user.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // helpers
  private sanitizeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isProfileComplete: user.isProfileComplete,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
  private sanitizePublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    };
  }
  private normalizePage(page?: number): number {
    return page && page > 0 ? page : 1;
  }

  private normalizePageSize(pageSize?: number): number {
    if (!pageSize || pageSize < 1) return 10;
    return Math.min(pageSize, 100);
  }

  private determineProfileCompletion(user: User): boolean {
    const hasName = !!user.name?.trim();
    const hasAvatar = !!user.avatar?.trim();

    return hasName && hasAvatar;
  }
  private buildMeta(totalUsers: number, currentPage: number, pageSize: number) {
    return {
      totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
      currentPage,
      pageSize,
    };
  }

  private isAdmin(currentUser: CurrentUser): boolean {
    return currentUser.role === String(UserRole.ADMIN);
  }

  // APIs
  async getCurrentUserProfile(currentUser: CurrentUser) {
    const user = await this.userRepository.findOne({
      where: {
        id: currentUser.id,
      },
    });
    if (!user) throw new NotFoundException('User Not Found');
    return this.sanitizeUser(user);
  }
  async updateCurrentUserProfile(
    currentUser: CurrentUser,
    dto: UpdateUserProfileDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser.id },
    });
    if (!user) throw new NotFoundException('User Not Found');
    if (dto.name) user.name = dto.name.trim();
    if (dto.avatar !== undefined) user.avatar = dto.avatar?.trim();
    if (dto.email) user.email = dto.email.trim();
    if (dto.role !== undefined) {
      if (!this.isAdmin(currentUser))
        throw new ForbiddenException('Only Admin can update user role');
      user.role = dto.role;
    }
    user.isProfileComplete = this.determineProfileCompletion(user);
    const savedUser = await this.userRepository.save(user);
    return this.sanitizeUser(savedUser);
  }
  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!user) throw new NotFoundException('User Not Found');
    return this.sanitizePublicUser(user);
  }
  async getAllUsers(queryDto: QueryUsersDto, currentUser: CurrentUser) {
    if (!this.isAdmin(currentUser))
      throw new ForbiddenException('Only Admin can get all users');
    const page = this.normalizePage(queryDto.page);
    const pageSize = this.normalizePageSize(queryDto.pageSize);
    const skip = (page - 1) * pageSize;

    const qb = this.userRepository.createQueryBuilder('user');
    if (queryDto.query?.trim()) {
      const q = `%${queryDto.query.trim().toLowerCase()}%`;
      qb.where(
        `
                LOWER(user.name) LIKE :q
                OR LOWER(user.email) LIKE :q
                `,
        { q },
      );
    }
    if (queryDto.role) {
      qb.andWhere('user.role = :role', { role: queryDto.role });
    }
    qb.orderBy('user.createdAt', 'DESC').skip(skip).take(pageSize);
    const [users, totalUsers] = await qb.getManyAndCount();
    return {
      data: users.map((user) => this.sanitizePublicUser(user)),
      meta: this.buildMeta(totalUsers, page, pageSize),
    };
  }
  async deleteUser(id: string, currentUser: CurrentUser) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!user) throw new NotFoundException('User Not Found');
    if (!this.isAdmin(currentUser))
      throw new ForbiddenException('Only Admin can delete user');
    await this.userRepository.remove(user);
    return { deleted: true, id: id };
  }
}
