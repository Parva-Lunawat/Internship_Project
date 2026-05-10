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
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ObservabilityForwarderService } from 'src/common/telemetry/observability-forwarder.service';
import { Blog, BlogStatus, BlogVisibility } from '../entities/blogs.entities';
import { BlogRevision, BlogRevisionAction } from '../entities/blog-revision.entity';
import { Tag } from '../entities/tag.entities';
import { User } from 'src/modules/Users/entities/user.entities';
import { Comment } from 'src/modules/Comments/entities/comment.entity';

import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { QueryBlogsDto } from '../dto/query-blog.dto';
import { ScheduleBlogDto } from '../dto/schedule-blog.dto';

import type { CurrentUser } from 'src/modules/Auth/types/current-user.type';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,

    @InjectRepository(BlogRevision)
    private readonly revisionsRepository: Repository<BlogRevision>,

    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @Optional()
    private readonly observability?: ObservabilityForwarderService,
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
  private trimOptional(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }
  private calculateReadingTime(content: string) {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 225));
  }
  private resolveCanonicalPath(value: string | undefined | null, pageTitle: string) {
    const trimmed = this.trimOptional(value);
    if (!trimmed) return `/blogs/${pageTitle}`;
    if (/^https?:\/\//i.test(trimmed)) {
      throw new BadRequestException('Canonical path must be relative.');
    }
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }
  private parseScheduledPublishAt(value?: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
      throw new BadRequestException('Scheduled publish time is invalid.');
    }
    if (date.getTime() <= Date.now()) {
      throw new BadRequestException('Scheduled publish time must be in the future.');
    }
    return date;
  }
  private isReservedPageTitle(pageTitle: string): boolean {
    const reserved = ['self-blogs', 'me', 'id', 'auth', 'users'];
    return reserved.includes(pageTitle);
  }
  private mapBlogResponse(blog: Blog, commentCount = 0) {
    return {
      ...blog,
      canonicalPath: blog.canonicalPath ?? `/blogs/${blog.pageTitle}`,
      readingTimeMinutes: blog.readingTimeMinutes ?? this.calculateReadingTime(blog.content ?? ''),
      commentCount,
      author: blog.author
        ? {
            id: blog.author.id,
            name: blog.author.name,
            avatar: blog.author.avatar,
          }
        : null,
    };
  }
  private async commentCountsForBlogs(blogIds: string[]) {
    if (blogIds.length === 0) return new Map<string, number>();
    if (!this.commentsRepository?.createQueryBuilder) {
      return new Map<string, number>();
    }
    const rows = await this.commentsRepository
      .createQueryBuilder('comment')
      .select('comment.blogId', 'blogId')
      .addSelect('COUNT(*)', 'count')
      .where('comment.blogId IN (:...blogIds)', { blogIds })
      .andWhere('comment.deletedAt IS NULL')
      .groupBy('comment.blogId')
      .getRawMany<{ blogId: string; count: string }>();
    return new Map(rows.map((row) => [row.blogId, Number(row.count)]));
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
  private resolvePublishingFields(
    existingBlog: Blog | null,
    status: BlogStatus,
    scheduledPublishAt?: string | null,
  ) {
    if (status === BlogStatus.PUBLISHED) {
      return {
        publishedAt: existingBlog?.publishedAt ?? new Date(),
        scheduledPublishAt: null,
      };
    }
    if (status === BlogStatus.SCHEDULED) {
      const parsed = this.parseScheduledPublishAt(
        scheduledPublishAt ?? existingBlog?.scheduledPublishAt?.toISOString(),
      );
      if (!parsed) {
        throw new BadRequestException('Scheduled posts require a future publish time.');
      }
      return { publishedAt: null, scheduledPublishAt: parsed };
    }
    return { publishedAt: null, scheduledPublishAt: null };
  }
  private applyPublishedAtOnUpdate(
    existingBlog: Blog,
    newStatus?: BlogStatus,
  ): Date | null {
    return this.resolvePublishingFields(
      existingBlog,
      newStatus ?? existingBlog.status,
      existingBlog.scheduledPublishAt?.toISOString(),
    ).publishedAt;
  }
  private canManageBlog(blog: Blog, currentUser: CurrentUser): boolean {
    if (blog.author?.id === currentUser.id) return true;
    if (currentUser.role === 'admin') return true;
    return false;
  }
  private async findManagedBlogById(
    blogId: string,
    currentUser: CurrentUser,
  ): Promise<Blog> {
    const blog = await this.blogsRepository.findOne({
      where: { id: blogId },
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
    return blog;
  }
  private mapRevision(revision: BlogRevision) {
    return {
      id: revision.id,
      blogId: revision.blogId,
      action: revision.action,
      title: revision.title,
      pageTitle: revision.pageTitle,
      status: revision.status,
      visibility: revision.visibility,
      readingTimeMinutes: revision.readingTimeMinutes,
      createdAt: revision.createdAt,
      editor: revision.editor
        ? {
            id: revision.editor.id,
            name: revision.editor.name,
          }
        : null,
    };
  }
  private async recordRevision(blog: Blog, editor: User | CurrentUser, action: BlogRevisionAction) {
    if (!this.revisionsRepository?.create) return;
    const revision = this.revisionsRepository.create({
      blog,
      blogId: blog.id,
      editor: editor as User,
      editorId: editor.id,
      action,
      pageTitle: blog.pageTitle,
      title: blog.title,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      content: blog.content,
      tagsSnapshot: blog.tags?.map((tag) => tag.name) ?? [],
      status: blog.status,
      visibility: blog.visibility,
      publishedAt: blog.publishedAt,
      scheduledPublishAt: blog.scheduledPublishAt,
      readingTimeMinutes: blog.readingTimeMinutes,
      featuredImageAlt: blog.featuredImageAlt,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      canonicalPath: blog.canonicalPath,
    });
    await this.revisionsRepository.save(revision);
  }
  private emitPublishingEvent(eventType: string, blog: Blog, userId: string, action: string) {
    this.observability?.emit('events', {
      endpoint: `/blogs/${blog.id}/${action}`,
      method: 'POST',
      timestamp: new Date().toISOString(),
      userId,
      eventType,
      payload: {
        blogId: blog.id,
        pageTitle: blog.pageTitle,
        status: blog.status,
        visibility: blog.visibility,
      },
    });
  }

  // Public APIs
  async getPublishedBlogs(queryDto: QueryBlogsDto) {
    const page = this.normalizePage(queryDto.page);
    const pageSize = this.normalizePageSize(queryDto.pageSize);

    const qb = this.blogsRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.author', 'author')
      .leftJoinAndSelect('blog.tags', 'tag')
      .where('blog.status = :status', { status: BlogStatus.PUBLISHED })
      .andWhere('blog.visibility = :visibility', { visibility: BlogVisibility.PUBLIC });
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

    const counts = await this.commentCountsForBlogs(blogs.map((blog) => blog.id));
    return {
      blogs: blogs.map((blog) => this.mapBlogResponse(blog, counts.get(blog.id) ?? 0)),
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
    const counts = await this.commentCountsForBlogs([blog.id]);
    return this.mapBlogResponse(blog, counts.get(blog.id) ?? 0);
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
    if (queryDto.visibility) {
      qb.andWhere('blog.visibility = :visibility', { visibility: queryDto.visibility });
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
    const counts = await this.commentCountsForBlogs(blogs.map((blog) => blog.id));
    return {
      blogs: blogs.map((blog) => this.mapBlogResponse(blog, counts.get(blog.id) ?? 0)),
      meta: this.buildMeta(totalBlogs, page, pageSize),
    };
  }
  // to be checked later
  async getMyBlogsById(blogId: string, currentUser: CurrentUser) {
    const blog = await this.findManagedBlogById(blogId, currentUser);
    const counts = await this.commentCountsForBlogs([blog.id]);
    return this.mapBlogResponse(blog, counts.get(blog.id) ?? 0);
  }
  async createBlog(dto: CreateBlogDto, currentUser: CurrentUser) {
    await this.ensureUniquePageTitle(dto.pageTitle);
    const author = await this.checkAuthorExist(currentUser.id);
    const tags = await this.resolveTags(dto.tags);
    const statusCheck = dto.status ?? BlogStatus.DRAFT;
    const pageTitle = dto.pageTitle.trim().toLowerCase();
    const publishingFields = this.resolvePublishingFields(
      null,
      statusCheck,
      dto.scheduledPublishAt,
    );
    const blog = this.blogsRepository.create({
      pageTitle,
      title: dto.title.trim(),
      excerpt: dto.excerpt.trim(),
      coverImage: dto.coverImage.trim(),
      content: dto.content.trim(),
      status: statusCheck,
      visibility: dto.visibility ?? BlogVisibility.PUBLIC,
      publishedAt: publishingFields.publishedAt,
      scheduledPublishAt: publishingFields.scheduledPublishAt,
      readingTimeMinutes: this.calculateReadingTime(dto.content),
      featuredImageAlt: this.trimOptional(dto.featuredImageAlt),
      metaTitle: this.trimOptional(dto.metaTitle),
      metaDescription: this.trimOptional(dto.metaDescription),
      canonicalPath: this.resolveCanonicalPath(dto.canonicalPath, pageTitle),
      author,
      tags,
    });
    await this.blogsRepository.save(blog);
    await this.recordRevision(blog, author, BlogRevisionAction.CREATE);
    this.emitPublishingEvent(
      statusCheck === BlogStatus.PUBLISHED ? 'post_published' : 'post_draft_saved',
      blog,
      currentUser.id,
      statusCheck === BlogStatus.PUBLISHED ? 'publish' : 'draft',
    );
    return this.mapBlogResponse(blog, 0);
  }
  async updateBlog(
    blogId: string,
    dto: UpdateBlogDto,
    currentUser: CurrentUser,
  ) {
    const updateBlog = await this.findManagedBlogById(blogId, currentUser);
    if (dto.pageTitle !== undefined) {
      const normalizedPageTitle = this.normalizedPageTitle(dto.pageTitle);
      await this.ensureUniquePageTitle(normalizedPageTitle, updateBlog.id);
      updateBlog.pageTitle = normalizedPageTitle;
      updateBlog.canonicalPath = this.resolveCanonicalPath(
        dto.canonicalPath ?? updateBlog.canonicalPath,
        normalizedPageTitle,
      );
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
      updateBlog.readingTimeMinutes = this.calculateReadingTime(updateBlog.content);
    }

    if (dto.visibility !== undefined) {
      updateBlog.visibility = dto.visibility;
    }

    if (dto.featuredImageAlt !== undefined) {
      updateBlog.featuredImageAlt = this.trimOptional(dto.featuredImageAlt);
    }

    if (dto.metaTitle !== undefined) {
      updateBlog.metaTitle = this.trimOptional(dto.metaTitle);
    }

    if (dto.metaDescription !== undefined) {
      updateBlog.metaDescription = this.trimOptional(dto.metaDescription);
    }

    if (dto.canonicalPath !== undefined) {
      updateBlog.canonicalPath = this.resolveCanonicalPath(
        dto.canonicalPath,
        updateBlog.pageTitle,
      );
    }

    const requestedStatus =
      dto.status ??
      (dto.scheduledPublishAt !== undefined ? BlogStatus.SCHEDULED : undefined);
    if (requestedStatus !== undefined) {
      const publishingFields = this.resolvePublishingFields(
        updateBlog,
        requestedStatus,
        dto.scheduledPublishAt,
      );
      updateBlog.publishedAt = publishingFields.publishedAt;
      updateBlog.scheduledPublishAt = publishingFields.scheduledPublishAt;
      updateBlog.status = requestedStatus;
    }

    if (dto.tags !== undefined) {
      updateBlog.tags = await this.resolveTags(dto.tags);
    }

    await this.blogsRepository.save(updateBlog);
    await this.recordRevision(updateBlog, currentUser, BlogRevisionAction.UPDATE);
    this.emitPublishingEvent('post_draft_saved', updateBlog, currentUser.id, 'update');
    const counts = await this.commentCountsForBlogs([updateBlog.id]);
    return this.mapBlogResponse(updateBlog, counts.get(updateBlog.id) ?? 0);
  }

  async publishBlog(blogId: string, currentUser: CurrentUser) {
    const blog = await this.findManagedBlogById(blogId, currentUser);
    const publishingFields = this.resolvePublishingFields(blog, BlogStatus.PUBLISHED);
    blog.status = BlogStatus.PUBLISHED;
    blog.publishedAt = publishingFields.publishedAt;
    blog.scheduledPublishAt = null;
    await this.blogsRepository.save(blog);
    await this.recordRevision(blog, currentUser, BlogRevisionAction.PUBLISH);
    this.emitPublishingEvent('post_published', blog, currentUser.id, 'publish');
    const counts = await this.commentCountsForBlogs([blog.id]);
    return this.mapBlogResponse(blog, counts.get(blog.id) ?? 0);
  }

  async unpublishBlog(blogId: string, currentUser: CurrentUser) {
    const blog = await this.findManagedBlogById(blogId, currentUser);
    blog.status = BlogStatus.DRAFT;
    blog.publishedAt = null;
    blog.scheduledPublishAt = null;
    await this.blogsRepository.save(blog);
    await this.recordRevision(blog, currentUser, BlogRevisionAction.UNPUBLISH);
    this.emitPublishingEvent('post_unpublished', blog, currentUser.id, 'unpublish');
    const counts = await this.commentCountsForBlogs([blog.id]);
    return this.mapBlogResponse(blog, counts.get(blog.id) ?? 0);
  }

  async scheduleBlog(blogId: string, dto: ScheduleBlogDto, currentUser: CurrentUser) {
    const blog = await this.findManagedBlogById(blogId, currentUser);
    const publishingFields = this.resolvePublishingFields(
      blog,
      BlogStatus.SCHEDULED,
      dto.scheduledPublishAt,
    );
    blog.status = BlogStatus.SCHEDULED;
    blog.publishedAt = null;
    blog.scheduledPublishAt = publishingFields.scheduledPublishAt;
    await this.blogsRepository.save(blog);
    await this.recordRevision(blog, currentUser, BlogRevisionAction.SCHEDULE);
    this.emitPublishingEvent('post_scheduled', blog, currentUser.id, 'schedule');
    const counts = await this.commentCountsForBlogs([blog.id]);
    return this.mapBlogResponse(blog, counts.get(blog.id) ?? 0);
  }

  async listRevisions(blogId: string, currentUser: CurrentUser) {
    await this.findManagedBlogById(blogId, currentUser);
    const [rows, total] = await this.revisionsRepository.findAndCount({
      where: { blogId },
      relations: { editor: true },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return {
      revisions: rows.map((revision) => this.mapRevision(revision)),
      meta: { total, limit: 50 },
    };
  }

  async restoreRevision(blogId: string, revisionId: string, currentUser: CurrentUser) {
    const blog = await this.findManagedBlogById(blogId, currentUser);
    const revision = await this.revisionsRepository.findOne({
      where: { id: revisionId, blogId },
    });
    if (!revision) throw new NotFoundException(`Revision ${revisionId} not found.`);

    await this.ensureUniquePageTitle(revision.pageTitle, blog.id);
    blog.pageTitle = revision.pageTitle;
    blog.title = revision.title;
    blog.excerpt = revision.excerpt;
    blog.coverImage = revision.coverImage;
    blog.content = revision.content;
    blog.tags = await this.resolveTags(revision.tagsSnapshot ?? []);
    blog.status = revision.status;
    blog.visibility = revision.visibility;
    blog.publishedAt = revision.publishedAt;
    blog.scheduledPublishAt = revision.scheduledPublishAt;
    blog.readingTimeMinutes = revision.readingTimeMinutes;
    blog.featuredImageAlt = revision.featuredImageAlt;
    blog.metaTitle = revision.metaTitle;
    blog.metaDescription = revision.metaDescription;
    blog.canonicalPath = revision.canonicalPath;
    await this.blogsRepository.save(blog);
    await this.recordRevision(blog, currentUser, BlogRevisionAction.RESTORE);
    this.emitPublishingEvent('revision_restored', blog, currentUser.id, 'restore');
    const counts = await this.commentCountsForBlogs([blog.id]);
    return this.mapBlogResponse(blog, counts.get(blog.id) ?? 0);
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
