import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsService } from './services/blogs.service';
import { BlogsController } from './controller/blogs.controller';
import { Blog } from './entities/blogs.entities';
import { User } from '../Users/entities/user.entities';
import { Tag } from './entities/tag.entities';
import { Comment } from '../Comments/entities/comment.entity';
import { BlogRevision } from './entities/blog-revision.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Blog, BlogRevision, User, Tag, Comment])],
  controllers: [BlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}
