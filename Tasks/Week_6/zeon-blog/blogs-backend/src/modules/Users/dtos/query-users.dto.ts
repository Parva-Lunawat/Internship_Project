import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { UserRole } from '../entities/user.entities';

export class QueryUsersDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    example: 'parva',
    description: 'Search in user name or email',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.WRITER,
    description: 'Filter by user role',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}