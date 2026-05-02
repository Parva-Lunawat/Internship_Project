import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { ObservabilityForwarderService } from 'src/common/telemetry/observability-forwarder.service';
import type { CurrentUser } from 'src/modules/Auth/types/current-user.type';
import { Blog } from '../../Blogs/entities/blogs.entities';
import { User, UserRole } from '../../Users/entities/user.entities';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { QueryCommentsDto } from '../dto/query-comments.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { Comment, CommentModerationStatus } from '../entities/comment.entity';

@Injectable()
export class CommentsService {
  private readonly createAttempts = new Map<string, number[]>();
  private readonly createLimit = 20;
  private readonly createWindowMs = 60_000;

  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Optional()
    private readonly observability?: ObservabilityForwarderService,
  ) {}

  private emit(eventType: string, payload: Record<string, unknown>, userId?: string) {
    this.observability?.emit('events', {
      endpoint: (payload.endpoint as string) || '/comments',
      method: (payload.method as string) || 'GET',
      timestamp: new Date().toISOString(),
      userId,
      eventType,
      payload,
    });
  }

  private sanitize(content: string) {
    const sanitized = content
      .trim()
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
    if (!sanitized) throw new BadRequestException('Comment content is required.');
    return sanitized;
  }

  private normalizePage(page?: number) {
    return page && page > 0 ? page : 1;
  }

  private normalizePageSize(pageSize?: number) {
    if (!pageSize || pageSize < 1) return 20;
    return Math.min(pageSize, 100);
  }

  private canManage(comment: Comment, currentUser: CurrentUser) {
    return comment.userId === currentUser.id || currentUser.role === UserRole.ADMIN || currentUser.role === 'admin';
  }

  private async getBlog(blogId: string) {
    const blog = await this.blogsRepository.findOne({
      where: { id: blogId },
      relations: { author: true },
    });
    if (!blog) throw new NotFoundException(`Blog ${blogId} not found.`);
    return blog;
  }

  private async getUser(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Comment author not found.');
    return user;
  }

  private async getComment(commentId: string, includeDeleted = false) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: { author: true, blog: { author: true } },
      withDeleted: includeDeleted,
    });
    if (!comment) throw new NotFoundException(`Comment ${commentId} not found.`);
    return comment;
  }

  private assertCreateRateLimit(userId: string, blogId: string) {
    const now = Date.now();
    const key = `${userId}:${blogId}`;
    const recent = (this.createAttempts.get(key) ?? []).filter((timestamp) => now - timestamp < this.createWindowMs);
    if (recent.length >= this.createLimit) {
      this.emit('comment_validation_failure', {
        endpoint: `/blogs/${blogId}/comments`,
        method: 'POST',
        reason: 'rate_limit',
        blogId,
      }, userId);
      throw new BadRequestException('Please wait before posting another comment.');
    }
    recent.push(now);
    this.createAttempts.set(key, recent);
  }

  private roleMetadata(comment: Comment, blog?: Blog | null) {
    const authorRole = comment.author?.role;
    const isAdmin = authorRole === UserRole.ADMIN;
    const isPostAuthor = Boolean(comment.author?.id && blog?.author?.id && comment.author.id === blog.author.id);
    return {
      isPostAuthor,
      isAdmin,
      roleLabel: isAdmin ? 'Admin' : isPostAuthor ? 'Author' : null,
    };
  }

  private mapComment(comment: Comment, blog?: Blog | null) {
    const deleted = Boolean(comment.deletedAt);
    const metadata = this.roleMetadata(comment, blog ?? comment.blog);
    return {
      id: comment.id,
      blogId: comment.blogId,
      parentCommentId: comment.parentCommentId,
      content: deleted ? '[deleted]' : comment.content,
      isDeleted: deleted,
      moderationStatus: comment.moderationStatus ?? CommentModerationStatus.VISIBLE,
      ...metadata,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      deletedAt: comment.deletedAt,
      author: comment.author
        ? {
            id: comment.author.id,
            name: comment.author.name,
            avatar: comment.author.avatar,
            role: comment.author.role,
            roleLabel: metadata.roleLabel,
          }
        : null,
    };
  }

  async listForBlog(blogId: string, query: QueryCommentsDto) {
    const started = performance.now();
    try {
      const blog = await this.getBlog(blogId);
      const page = this.normalizePage(query.page);
      const pageSize = this.normalizePageSize(query.pageSize);
      const where = {
        blogId,
        ...(query.parentCommentId !== undefined
          ? { parentCommentId: query.parentCommentId || IsNull() }
          : {}),
      };
      const [rows, totalComments] = await this.commentsRepository.findAndCount({
        where,
        relations: { author: true },
        withDeleted: true,
        order: { createdAt: query.sort === 'desc' ? 'DESC' : 'ASC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      this.emit('comment_fetch_success', {
        endpoint: `/blogs/${blogId}/comments`,
        method: 'GET',
        blogId,
        totalComments,
        latencyMs: performance.now() - started,
      });
      return {
        comments: rows.map((comment) => this.mapComment(comment, blog)),
        meta: {
          totalComments,
          totalPages: Math.ceil(totalComments / pageSize),
          currentPage: page,
          pageSize,
        },
      };
    } catch (err) {
      this.emit('comment_fetch_failure', {
        endpoint: `/blogs/${blogId}/comments`,
        method: 'GET',
        blogId,
        reason: err instanceof Error ? err.message : 'unknown',
      });
      throw err;
    }
  }

  async create(blogId: string, dto: CreateCommentDto, currentUser: CurrentUser) {
    const started = performance.now();
    const blog = await this.getBlog(blogId);
    const author = await this.getUser(currentUser.id);
    this.assertCreateRateLimit(author.id, blogId);
    let parent: Comment | null = null;
    if (dto.parentCommentId) {
      parent = await this.getComment(dto.parentCommentId, true);
      if (parent.blogId !== blogId) {
        this.emit('comment_validation_failure', { endpoint: `/blogs/${blogId}/comments`, method: 'POST', reason: 'parent_blog_mismatch', blogId }, currentUser.id);
        throw new BadRequestException('Parent comment must belong to the same blog.');
      }
    }
    const comment = this.commentsRepository.create({
      blog,
      blogId,
      author,
      userId: author.id,
      parent,
      parentCommentId: parent?.id ?? null,
      content: this.sanitize(dto.content),
      moderationStatus: CommentModerationStatus.VISIBLE,
    });
    const saved = await this.commentsRepository.save(comment);
    this.emit('comment_created', {
      endpoint: `/blogs/${blogId}/comments`,
      method: 'POST',
      blogId,
      commentId: saved.id,
      latencyMs: performance.now() - started,
    }, currentUser.id);
    return this.mapComment({ ...saved, author, blog }, blog);
  }

  async update(commentId: string, dto: UpdateCommentDto, currentUser: CurrentUser) {
    const comment = await this.getComment(commentId);
    if (comment.deletedAt) throw new BadRequestException('Deleted comments cannot be updated.');
    if (!this.canManage(comment, currentUser)) {
      this.emit('comment_authorization_failure', { endpoint: `/comments/${commentId}`, method: 'PATCH', reason: 'not_owner_or_admin', commentId }, currentUser.id);
      throw new ForbiddenException('You are not authorized to update this comment.');
    }
    comment.content = this.sanitize(dto.content);
    const saved = await this.commentsRepository.save(comment);
    this.emit('comment_updated', { endpoint: `/comments/${commentId}`, method: 'PATCH', commentId, blogId: comment.blogId }, currentUser.id);
    return this.mapComment(saved);
  }

  async delete(commentId: string, currentUser: CurrentUser) {
    const comment = await this.getComment(commentId, true);
    if (!this.canManage(comment, currentUser)) {
      this.emit('comment_authorization_failure', { endpoint: `/comments/${commentId}`, method: 'DELETE', reason: 'not_owner_or_admin', commentId }, currentUser.id);
      throw new ForbiddenException('You are not authorized to delete this comment.');
    }
    if (!comment.deletedAt) await this.commentsRepository.softDelete(comment.id);
    this.emit('comment_deleted', { endpoint: `/comments/${commentId}`, method: 'DELETE', commentId, blogId: comment.blogId }, currentUser.id);
    return { deleted: true, id: commentId };
  }

  async countForBlogs(blogIds: string[]) {
    if (blogIds.length === 0) return new Map<string, number>();
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
}

