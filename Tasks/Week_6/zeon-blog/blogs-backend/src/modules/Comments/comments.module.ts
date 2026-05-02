import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Blog } from '../Blogs/entities/blogs.entities';
import { User } from '../Users/entities/user.entities';
import { CommentsController } from './controller/comments.controller';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './services/comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Blog, User])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
