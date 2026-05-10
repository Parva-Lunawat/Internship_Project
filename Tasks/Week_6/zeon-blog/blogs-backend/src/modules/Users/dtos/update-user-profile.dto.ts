import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { UserRole } from '../entities/user.entities';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    example: 'Parva Lunawat',
    description: 'Display name of the user',
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MinLength(4, { message: 'Name must be at least 4 characters long' })
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    description: 'Avatar image URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  avatar?: string;

  @ApiPropertyOptional({
    example: 'demo@demo.com',
    description: 'Email of the user',
  })
  @IsNotEmpty({ message: 'Email address is required' })
  @IsString()
  @IsEmail()
  @MaxLength(1000)
  email?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.WRITER,
    description: 'Role of the user; should be updated only by admin',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
