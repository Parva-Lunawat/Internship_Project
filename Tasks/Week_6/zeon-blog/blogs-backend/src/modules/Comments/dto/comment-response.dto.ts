import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentModerationStatus } from '../entities/comment.entity';

export class CommentAuthorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  avatar: string | null;

  @ApiProperty()
  role: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Display-safe role label derived by the backend.',
  })
  roleLabel?: string | null;
}

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  blogId: string;

  @ApiProperty({ nullable: true })
  parentCommentId: string | null;

  @ApiProperty({
    description: 'Comment content, or a deleted placeholder for soft-deleted comments.',
  })
  content: string;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty({
    enum: CommentModerationStatus,
    description: 'Moderation state. Added additively for Phase 4 clients.',
  })
  moderationStatus: CommentModerationStatus;

  @ApiProperty({
    description: 'True when the comment author is also the blog post author.',
  })
  isPostAuthor: boolean;

  @ApiProperty({
    description: 'True when the comment author has an admin role.',
  })
  isAdmin: boolean;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Display-safe role label. Current values include Author and Admin.',
  })
  roleLabel?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  deletedAt: Date | null;

  @ApiProperty({ type: CommentAuthorResponseDto, nullable: true })
  author: CommentAuthorResponseDto | null;
}

export class CommentsListMetaResponseDto {
  @ApiProperty()
  totalComments: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  pageSize: number;
}

export class CommentsListResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  comments: CommentResponseDto[];

  @ApiProperty({ type: CommentsListMetaResponseDto })
  meta: CommentsListMetaResponseDto;
}

export class DeleteCommentResponseDto {
  @ApiProperty()
  deleted: boolean;

  @ApiProperty()
  id: string;
}
