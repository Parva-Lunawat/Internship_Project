import { ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';

function buildService(overrides: Record<string, any> = {}) {
  const commentRepo = {
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ id: 'comment-1', createdAt: new Date(), updatedAt: new Date(), deletedAt: null, ...value })),
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
  const blogRepo = { findOne: jest.fn(async () => ({ id: 'blog-1' })), ...overrides.blogRepo };
  const userRepo = { findOne: jest.fn(async () => ({ id: 'user-1', name: 'Ada', avatar: null, role: 'writer' })), ...overrides.userRepo };
  const observability = { emit: jest.fn() };
  return { service: new CommentsService(commentRepo as any, blogRepo as any, userRepo as any, observability as any), commentRepo, blogRepo, userRepo, observability };
}

describe('CommentsService', () => {
  it('creates sanitized comments for authenticated users', async () => {
    const { service, commentRepo } = buildService();

    const result = await service.create('blog-1', { content: '<b>Hello</b><script>alert(1)</script>' }, { id: 'user-1', email: 'a@b.com', role: 'writer' });

    expect(commentRepo.save).toHaveBeenCalledWith(expect.objectContaining({ content: 'Hello' }));
    expect(result.content).toBe('Hello');
  });

  it('blocks updates from users who do not own the comment', async () => {
    const { service } = buildService({
      commentRepo: {
        findOne: jest.fn(async () => ({ id: 'comment-1', blogId: 'blog-1', userId: 'owner-1', content: 'Old', deletedAt: null, author: { id: 'owner-1', name: 'Owner', avatar: null, role: 'writer' } })),
      },
    });

    await expect(service.update('comment-1', { content: 'Nope' }, { id: 'user-2', email: 'x@y.com', role: 'writer' })).rejects.toBeInstanceOf(ForbiddenException);
  });
});
