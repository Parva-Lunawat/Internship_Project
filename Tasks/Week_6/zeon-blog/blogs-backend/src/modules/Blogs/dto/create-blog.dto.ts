import {
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsOptional,
  IsString,
  IsISO8601,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus, BlogVisibility } from '../entities/blogs.entities';

export class CreateBlogDto {
  @ApiProperty({
    example: 'hello-nextjs',
    description: 'Unique page title / slug used in route path',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  pageTitle: string;

  @ApiProperty({
    example: 'Hello Next.js: The Future of React Frameworks',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'My first post using Next.js App Router + TS + Tailwind.',
  })
  @IsString()
  @MinLength(50, { message: 'Excerpt must be at least 50 characters long' })
  @MaxLength(500)
  excerpt: string;

  @ApiProperty({
    example:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200',
  })
  @IsString()
  @MaxLength(1000)
  coverImage: string;

  @ApiProperty({
    example: 'Full blog content goes here...',
  })
  @IsString()
  @MinLength(200, { message: 'Content must be at least 200 characters long' })
  content: string;

  @ApiPropertyOptional({
    example: ['nextjs', 'typescript'],
    description:
      'Tags as plain strings; service will normalize/create Tag entities',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiPropertyOptional({
    enum: BlogStatus,
    example: BlogStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({
    enum: BlogVisibility,
    example: BlogVisibility.PUBLIC,
  })
  @IsOptional()
  @IsEnum(BlogVisibility)
  visibility?: BlogVisibility;

  @ApiPropertyOptional({
    description: 'Future publish date/time used when status is scheduled.',
  })
  @IsOptional()
  @IsISO8601()
  scheduledPublishAt?: string;

  @ApiPropertyOptional({
    description: 'Accessible alternative text for the featured image.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  featuredImageAlt?: string;

  @ApiPropertyOptional({
    description: 'Search/share title override.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'Search/share description override.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'Canonical path override for SEO metadata.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  canonicalPath?: string;
}
