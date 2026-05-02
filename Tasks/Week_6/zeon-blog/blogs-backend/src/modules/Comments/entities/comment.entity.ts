import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Blog } from '../../Blogs/entities/blogs.entities';
import { User } from '../../Users/entities/user.entities';

export enum CommentModerationStatus {
  VISIBLE = 'visible',
  REVIEW = 'review',
  HIDDEN = 'hidden',
}

@Entity({ name: 'comments' })
@Index('idx_comments_blog_id', ['blogId'])
@Index('idx_comments_user_id', ['userId'])
@Index('idx_comments_parent_id', ['parentCommentId'])
@Index('idx_comments_created_at', ['createdAt'])
@Index('idx_comments_deleted_at', ['deletedAt'])
@Index('idx_comments_moderation_status', ['moderationStatus'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  blogId: string;

  @ManyToOne(() => Blog, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  author: User;

  @Column({ type: 'uuid', nullable: true })
  parentCommentId: string | null;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentCommentId' })
  parent: Comment | null;

  @Column({ type: 'longtext' })
  content: string;

  @Column({
    type: 'enum',
    enum: CommentModerationStatus,
    default: CommentModerationStatus.VISIBLE,
  })
  moderationStatus: CommentModerationStatus;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt: Date | null;
}
