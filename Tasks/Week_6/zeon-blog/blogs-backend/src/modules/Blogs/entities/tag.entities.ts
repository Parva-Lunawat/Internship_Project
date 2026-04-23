import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Blog } from './blogs.entities';

@Entity({ name: 'tags' })
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80, unique: true })
  name: string;

  @ManyToMany(() => Blog, (blog) => blog.tags)
  blogs: Blog[];
}
