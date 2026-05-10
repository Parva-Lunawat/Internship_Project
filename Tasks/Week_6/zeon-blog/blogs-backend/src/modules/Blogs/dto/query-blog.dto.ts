import { IsInt, Min, IsEnum, IsOptional, IsString, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BlogStatus, BlogVisibility } from '../entities/blogs.entities';

export class QueryBlogsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 6;

  @ApiPropertyOptional({
    example: 'nextjs',
    description:
      'Search in title, excerpt, content, and optionally author name',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    example: 'typescript',
  })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    enum: BlogStatus,
    example: BlogStatus.PUBLISHED,
    description: 'Useful for internal endpoints like /blogs/mine',
  })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({
    enum: BlogVisibility,
    description: 'Visibility filter for internal editorial views.',
  })
  @IsOptional()
  @IsEnum(BlogVisibility)
  visibility?: BlogVisibility;
}
