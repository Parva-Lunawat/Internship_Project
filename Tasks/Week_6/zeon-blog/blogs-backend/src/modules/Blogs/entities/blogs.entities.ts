// export type posts = {
//     pageTitle: string;
//     title: string;
//     excerpt: string;
//     coverImage: string;
//     content: string;
//     tags: Array<string>;
//     publishedAt: string;
//     status: "draft" | "published";
//     // New Author Type
//     author: {
//         name: string;
//         avatar: string;
//     };
// };

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../Users/entities/user.entities';
import { Tag } from './tag.entities';

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity({ name: 'blogs' })
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
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

  @Column({ type: 'enum', enum: BlogStatus, default: BlogStatus.DRAFT })
  status: BlogStatus;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @ManyToOne(() => User, (user) => user.blogs, { nullable: false })
  author: User;

  @ManyToMany(() => Tag, (tag) => tag.blogs, { cascade: true })
  @JoinTable({
    name: 'blog_tags',
  })
  tags: Tag[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
