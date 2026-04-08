// id
// name
// email
// passwordHash
// avatar
// role (writer / reader / maybe admin later)
// timestamps

import { Column, Entity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Blog } from '../../Blogs/entities/blogs.entities';
import { Exclude } from "class-transformer";

export enum UserRole {
    WRITER = "writer",
    READER = "reader",
    ADMIN = "admin",
}

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: "varchar", length: 120 })
    name: string;

    @Index({ unique: true })
    @Column({ type: "varchar", length: 200 })
    email: string;

    @Column({ type: "varchar", length: 255 })
    @Exclude()
    passwordHash: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    avatar: string | null;

    @Column({ type: 'boolean', default: false })
    isProfileComplete: boolean;

    @Column({ type: "enum", enum: UserRole, default: UserRole.WRITER })
    role: UserRole;

    @OneToMany(() => Blog, (blog) => blog.author)
    blogs: Blog[];

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date;
}