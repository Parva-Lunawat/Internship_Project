import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../Users/entities/user.entities';
import { Blog, BlogStatus, BlogVisibility } from './blogs.entities';

export enum BlogRevisionAction {
  CREATE = 'create',
  UPDATE = 'update',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  SCHEDULE = 'schedule',
  RESTORE = 'restore',
}

@Entity({ name: 'blog_revisions' })
@Index('idx_blog_revisions_blog_id', ['blogId'])
@Index('idx_blog_revisions_editor_id', ['editorId'])
@Index('idx_blog_revisions_created_at', ['createdAt'])
export class BlogRevision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  blogId: string;

  @ManyToOne(() => Blog, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @Column({ type: 'uuid' })
  editorId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'editorId' })
  editor: User;

  @Column({ type: 'enum', enum: BlogRevisionAction })
  action: BlogRevisionAction;

  @Column({ type: 'varchar', length: 100 })
  pageTitle: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 500 })
  excerpt: string;

  @Column({ type: 'varchar', length: 1000 })
  coverImage: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'json', nullable: true })
  tagsSnapshot: string[] | null;

  @Column({ type: 'enum', enum: BlogStatus })
  status: BlogStatus;

  @Column({ type: 'enum', enum: BlogVisibility })
  visibility: BlogVisibility;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  scheduledPublishAt: Date | null;

  @Column({ type: 'int', default: 1 })
  readingTimeMinutes: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  featuredImageAlt: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  metaDescription: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  canonicalPath: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
