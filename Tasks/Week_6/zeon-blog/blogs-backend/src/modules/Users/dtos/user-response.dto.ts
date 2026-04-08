import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entities';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  avatar: string | null;

  @ApiProperty()
  isProfileComplete: boolean;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}