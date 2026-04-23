// Public
// list published blogs
// filter by query
// filter by tag
// paginate
// get one published blog by pageTitle
// Writer
// create blog
// update own blog
// delete own blog
// list my blogs
// get my blog by id

import {
  NotFoundException,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Blog, BlogStatus } from '../entities/blogs.entities';
import { Tag } from '../entities/tag.entities';
import { User } from 'src/modules/Users/entities/user.entities';

import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { QueryBlogsDto } from '../dto/query-blog.dto';

import type { CurrentUser } from 'src/modules/Auth/types/current-user.type';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,

    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Private Helpers
  private normalizePage(page?: number): number {
    return page && page > 0 ? page : 1;
  }
  private normalizePageSize(pageSize?: number): number {
    if (!pageSize || pageSize < 1) return 6;
    return Math.min(pageSize, 50);
  }
  private normalizedPageTitle(title: string) {
    return title.trim().toLowerCase();
  }
  private isReservedPageTitle(pageTitle: string): boolean {
    const reserved = ['self-blogs', 'me', 'id', 'auth', 'users'];
    return reserved.includes(pageTitle);
  }
  private mapBlogResponse(blog: Blog) {
    return {
      ...blog,
      author: blog.author
        ? {
            id: blog.author.id,
            name: blog.author.name,
            avatar: blog.author.avatar,
          }
        : null,
    };
  }
  private async ensureUniquePageTitle(
    pageTitle: string,
    checkingBlogId?: string,
  ): Promise<void> {
    const normalized = this.normalizedPageTitle(pageTitle);
    if (this.isReservedPageTitle(normalized))
      throw new BadRequestException('This is a reserved PageTitle.');
    const existing = await this.blogsRepository.findOne({
      where: {
        pageTitle: normalized,
      },
    });
    if (existing && existing.id !== checkingBlogId)
      throw new BadRequestException('PageTitle Already Exists.');
  }
  private async resolveTags(tagNames?: string[]): Promise<Tag[]> {
    if (!tagNames || tagNames.length === 0) return [];
    const normalizedUniqueTags = [
      ...new Set(
        tagNames.map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      ),
    ];
    if (normalizedUniqueTags.length === 0) return [];
    const existingTags = await this.tagsRepository.find({
      where: {
        name: In(normalizedUniqueTags),
      },
    });
    const existingMap = new Map(existingTags.map((tag) => [tag.name, tag]));
    const tagsToCreate: Tag[] = [];
    normalizedUniqueTags.forEach((tagName) => {
      if (!existingMap.has(tagName)) {
        const newTag = this.tagsRepository.create({ name: tagName });
        tagsToCreate.push(newTag);
      }
    });

    const savedNewTags =
      tagsToCreate.length > 0
        ? await this.tagsRepository.save(tagsToCreate)
        : [];
    return [...existingTags, ...savedNewTags];
  }
  private async checkAuthorExist(userId: string): Promise<User> {
    const author = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!author) throw new NotFoundException('Author Not Found');
    return author;
  }
  private buildMeta(totalBlogs: number, currentPage: number, pageSize: number) {
    return {
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / pageSize),
      currentPage,
      pageSize,
    };
  }
  private applyPublishedAtOnCreate(status?: BlogStatus): Date | null {
    return status === BlogStatus.PUBLISHED ? new Date() : null;
  }
  private applyPublishedAtOnUpdate(
    existingBlog: Blog,
    newStatus?: BlogStatus,
  ): Date | null {
    const previousState = existingBlog.status;
    const newState = newStatus ?? previousState;

    if (
      previousState === BlogStatus.PUBLISHED &&
      newState !== BlogStatus.DRAFT
    ) {
      return null;
    }
    if (
      previousState === BlogStatus.DRAFT &&
      newState === BlogStatus.PUBLISHED
    ) {
      return new Date();
    }
    return existingBlog.publishedAt;
  }
  private canManageBlog(blog: Blog, currentUser: CurrentUser): boolean {
    if (blog.author?.id === currentUser.id) return true;
    if (currentUser.role === 'admin') return true;
    return false;
  }

  // Public APIs
  async getPublishedBlogs(queryDto: QueryBlogsDto) {
    const page = this.normalizePage(queryDto.page);
    const pageSize = this.normalizePageSize(queryDto.pageSize);

    const qb = this.blogsRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.author', 'author')
      .leftJoinAndSelect('blog.tags', 'tag')
      .where('blog.status = :status', { status: BlogStatus.PUBLISHED });
    if (queryDto.query?.trim()) {
      const q = `%${queryDto.query.trim().toLowerCase()}%`;
      qb.andWhere(
        `(
                    LOWER(blog.title) LIKE :q
                    OR LOWER(blog.excerpt) LIKE :q
                    OR LOWER(blog.content) LIKE :q
                    OR LOWER(author.name) LIKE :q
                )`,
        { q },
      );
    }
    if (queryDto.tag?.trim()) {
      const normalizedTags = queryDto.tag.trim().toLowerCase();
      qb.andWhere(`(LOWER(tag.name) = :tag)`, { tag: normalizedTags });
    }
    qb.orderBy('blog.publishedAt', 'DESC')
      .addOrderBy('blog.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    const [blogs, totalBlogs] = await qb.getManyAndCount();

    return {
      blogs: blogs.map(this.mapBlogResponse),
      meta: this.buildMeta(totalBlogs, page, pageSize),
    };
  }
  async getPublishedBlogByPageTitle(pageTitle: string) {
    const blog = await this.blogsRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.author', 'author')
      .leftJoinAndSelect('blog.tags', 'tag')
      .where('blog.pageTitle = :pageTitle', {
        pageTitle: pageTitle.trim().toLowerCase(),
      })
      .andWhere('blog.status = :status', {
        status: BlogStatus.PUBLISHED,
      })
      .getOne();

    if (!blog) {
      throw new NotFoundException(
        `Published blog with pageTitle "${pageTitle}" not found.`,
      );
    }
    return this.mapBlogResponse(blog);
  }

  // Writer APIs
  async getMyBlogs(currentUser: CurrentUser, queryDto: QueryBlogsDto) {
    const page = this.normalizePage(queryDto.page);
    const pageSize = this.normalizePageSize(queryDto.pageSize);

    const qb = this.blogsRepository
      .createQueryBuilder('blog')
      .leftJoin('blog.author', 'author')
      .addSelect(['author.id', 'author.name', 'author.avatar'])
      .leftJoinAndSelect('blog.tags', 'tag')
      .where('author.id = :authorId', { authorId: currentUser.id });
    if (queryDto.status) {
      qb.andWhere('blog.status = :status', { status: queryDto.status });
    }
    if (queryDto.query?.trim()) {
      const q = `%${queryDto.query.trim().toLowerCase()}%`;
      qb.andWhere(
        `(
                    LOWER(blog.title) LIKE :q
                    OR LOWER(blog.excerpt) LIKE :q
                    OR LOWER(blog.content) LIKE :q
                    OR LOWER(author.name) LIKE :q
                )`,
        { q },
      );
    }
    if (queryDto.tag?.trim()) {
      const normalizedTags = queryDto.tag.trim().toLowerCase();
      qb.andWhere(`(LOWER(tag.name) = :tag)`, { tag: normalizedTags });
    }
    qb.orderBy('blog.publishedAt', 'DESC')
      .addOrderBy('blog.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    const [blogs, totalBlogs] = await qb.getManyAndCount();
    return {
      blogs: blogs.map(this.mapBlogResponse),
      meta: this.buildMeta(totalBlogs, page, pageSize),
    };
  }
  // to be checked later
  async getMyBlogsById(blogId: string, currentUser: CurrentUser) {
    const blog = await this.blogsRepository.findOne({
      where: {
        id: blogId,
        author: { id: currentUser.id },
      },
      relations: {
        author: true,
        tags: true,
      },
    });
    if (!blog) throw new NotFoundException(`Blog ${blogId} not found.`);
    if (!this.canManageBlog(blog, currentUser))
      throw new ForbiddenException(
        'You are not authorized to perform this action.',
      );
    return this.mapBlogResponse(blog);
  }
  async createBlog(dto: CreateBlogDto, currentUser: CurrentUser) {
    await this.ensureUniquePageTitle(dto.pageTitle);
    const author = await this.checkAuthorExist(currentUser.id);
    const tags = await this.resolveTags(dto.tags);
    const statusCheck = dto.status ?? BlogStatus.DRAFT;
    const blog = this.blogsRepository.create({
      pageTitle: dto.pageTitle.trim().toLowerCase(),
      title: dto.title.trim(),
      excerpt: dto.excerpt.trim(),
      coverImage: dto.coverImage.trim(),
      content: dto.content.trim(),
      status: statusCheck,
      publishedAt: this.applyPublishedAtOnCreate(statusCheck),
      author,
      tags,
    });
    await this.blogsRepository.save(blog);
    return this.mapBlogResponse(blog);
  }
  async updateBlog(
    blogId: string,
    dto: UpdateBlogDto,
    currentUser: CurrentUser,
  ) {
    const updateBlog = await this.blogsRepository.findOne({
      where: { id: blogId, author: { id: currentUser.id } },
      relations: {
        author: true,
        tags: true,
      },
    });
    if (!updateBlog) throw new NotFoundException(`Blog ${blogId} not found.`);
    if (!this.canManageBlog(updateBlog, currentUser))
      throw new ForbiddenException(
        'You are not authorized to perform this action.',
      );
    if (dto.pageTitle !== undefined) {
      const normalizedPageTitle = this.normalizedPageTitle(dto.pageTitle);
      await this.ensureUniquePageTitle(normalizedPageTitle, updateBlog.id);
      updateBlog.pageTitle = normalizedPageTitle;
    }

    if (dto.title !== undefined) {
      updateBlog.title = dto.title.trim();
    }

    if (dto.excerpt !== undefined) {
      updateBlog.excerpt = dto.excerpt.trim();
    }

    if (dto.coverImage !== undefined) {
      updateBlog.coverImage = dto.coverImage.trim();
    }

    if (dto.content !== undefined) {
      updateBlog.content = dto.content.trim();
    }

    if (dto.status !== undefined) {
      updateBlog.publishedAt = this.applyPublishedAtOnUpdate(
        updateBlog,
        dto.status,
      );
      updateBlog.status = dto.status;
    }

    if (dto.tags !== undefined) {
      updateBlog.tags = await this.resolveTags(dto.tags);
    }

    await this.blogsRepository.save(updateBlog);
    return this.mapBlogResponse(updateBlog);
  }
  async deleteBlog(
    blogId: string,
    currentUser: CurrentUser,
  ): Promise<{ deleted: true; id: string }> {
    const blog = await this.blogsRepository.findOne({
      where: { id: blogId },
      relations: {
        author: true,
      },
    });
    if (!blog) throw new NotFoundException(`Blog ${blogId} not found.`);
    if (!this.canManageBlog(blog, currentUser))
      throw new ForbiddenException(
        'You are not authorized to perform this action.',
      );
    await this.blogsRepository.remove(blog);
    return { deleted: true, id: blogId };
  }
}
