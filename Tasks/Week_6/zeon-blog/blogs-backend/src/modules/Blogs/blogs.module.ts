import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsService } from './services/blogs.service';
import { BlogsController } from './controller/blogs.controller';
import { Blog } from './entities/blogs.entities';
import { User } from '../Users/entities/user.entities';
import { Tag } from './entities/tag.entities';
@Module({
  imports: [TypeOrmModule.forFeature([Blog, User, Tag])],
  controllers: [BlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}
