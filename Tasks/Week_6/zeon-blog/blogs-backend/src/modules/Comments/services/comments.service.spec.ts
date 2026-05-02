import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';

function buildService(overrides: Record<string, any> = {}) {
  const commentRepo = {
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({
      id: 'comment-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...value,
    })),
    softDelete: jest.fn(async () => undefined),
    findAndCount: jest.fn(async () => [[], 0]),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(async () => []),
    })),
    ...overrides.commentRepo,
  };
  const blogRepo = {
    findOne: jest.fn(async () => ({ id: 'blog-1', author: { id: 'user-1' } })),
    ...overrides.blogRepo,
  };
  const userRepo = {
    findOne: jest.fn(async () => ({ id: 'user-1', name: 'Ada', avatar: null, role: 'writer' })),
    ...overrides.userRepo,
  };
  const observability = { emit: jest.fn() };
  return {
    service: new CommentsService(commentRepo as any, blogRepo as any, userRepo as any, observability as any),
    commentRepo,
    blogRepo,
    userRepo,
    observability,
  };
}

describe('CommentsService', () => {
  it('creates sanitized comments for authenticated users', async () => {
    const { service, commentRepo } = buildService();

    const result = await service.create('blog-1', { content: '<b>Hello</b><script>alert(1)</script>' }, { id: 'user-1', email: 'a@b.com', role: 'writer' });

    expect(commentRepo.save).toHaveBeenCalledWith(expect.objectContaining({ content: 'Hello' }));
    expect(result.content).toBe('Hello');
  });

  it('marks comments from the blog author with server-derived author metadata', async () => {
    const { service } = buildService();

    const result = await service.create('blog-1', { content: 'Author note' }, { id: 'user-1', email: 'a@b.com', role: 'writer' });

    expect(result.isPostAuthor).toBe(true);
    expect(result.isAdmin).toBe(false);
    expect(result.roleLabel).toBe('Author');
    expect(result.author?.roleLabel).toBe('Author');
    expect(result.moderationStatus).toBe('visible');
  });

  it('marks admin comments with server-derived admin metadata', async () => {
    const { service } = buildService({
      blogRepo: {
        findOne: jest.fn(async () => ({ id: 'blog-1', author: { id: 'writer-1' } })),
      },
      userRepo: {
        findOne: jest.fn(async () => ({ id: 'admin-1', name: 'Admin', avatar: null, role: 'admin' })),
      },
    });

    const result = await service.create('blog-1', { content: 'Admin note' }, { id: 'admin-1', email: 'admin@example.test', role: 'admin' });

    expect(result.isPostAuthor).toBe(false);
    expect(result.isAdmin).toBe(true);
    expect(result.roleLabel).toBe('Admin');
    expect(result.author?.roleLabel).toBe('Admin');
  });

  it('blocks updates from users who do not own the comment', async () => {
    const { service } = buildService({
      commentRepo: {
        findOne: jest.fn(async () => ({
          id: 'comment-1',
          blogId: 'blog-1',
          userId: 'owner-1',
          content: 'Old',
          deletedAt: null,
          moderationStatus: 'visible',
          author: { id: 'owner-1', name: 'Owner', avatar: null, role: 'writer' },
        })),
      },
    });

    await expect(service.update('comment-1', { content: 'Nope' }, { id: 'user-2', email: 'x@y.com', role: 'writer' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows admins to update comments they do not own', async () => {
    const { service } = buildService({
      commentRepo: {
        findOne: jest.fn(async () => ({
          id: 'comment-1',
          blogId: 'blog-1',
          userId: 'owner-1',
          content: 'Old',
          deletedAt: null,
          moderationStatus: 'visible',
          author: { id: 'owner-1', name: 'Owner', avatar: null, role: 'writer' },
          blog: { id: 'blog-1', author: { id: 'owner-1' } },
        })),
      },
    });

    const result = await service.update('comment-1', { content: 'Admin edit' }, { id: 'admin-1', email: 'admin@example.test', role: 'admin' });

    expect(result.content).toBe('Admin edit');
  });

  it('keeps deleted comments renderable as placeholders', async () => {
    const { service, commentRepo } = buildService({
      commentRepo: {
        findAndCount: jest.fn(async () => [[{
          id: 'comment-1',
          blogId: 'blog-1',
          parentCommentId: null,
          content: 'Old',
          deletedAt: new Date('2026-01-01T00:00:00.000Z'),
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          moderationStatus: 'visible',
          author: { id: 'user-1', name: 'Ada', avatar: null, role: 'writer' },
        }], 1]),
      },
    });

    const result = await service.listForBlog('blog-1', { page: 1, pageSize: 20, sort: 'asc' });

    expect(commentRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ withDeleted: true }));
    expect(result.comments[0].isDeleted).toBe(true);
    expect(result.comments[0].content).toBe('[deleted]');
  });

  it('throttles excessive comment creation bursts per user and blog', async () => {
    const { service } = buildService();

    for (let i = 0; i < 20; i += 1) {
      await service.create('blog-1', { content: `Comment ${i}` }, { id: 'user-1', email: 'a@b.com', role: 'writer' });
    }

    await expect(service.create('blog-1', { content: 'Too much' }, { id: 'user-1', email: 'a@b.com', role: 'writer' })).rejects.toBeInstanceOf(BadRequestException);
  });
});
