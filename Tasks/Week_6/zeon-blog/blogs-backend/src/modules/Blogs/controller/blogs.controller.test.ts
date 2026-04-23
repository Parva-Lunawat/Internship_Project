import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BlogStatus } from '../entities/blogs.entities';
import { BlogsController } from './blogs.controller';

describe('BlogsController (vitest)', () => {
  let controller: BlogsController;
  const blogsService = {
    getPublishedBlogs: vi.fn(),
    createBlog: vi.fn(),
    updateBlog: vi.fn(),
  };

  beforeEach(() => {
    Object.values(blogsService).forEach((fn) => fn.mockReset());
    controller = new BlogsController(blogsService as any);
  });

  it('returns data from getPublishedBlogs service', async () => {
    blogsService.getPublishedBlogs.mockResolvedValueOnce({
      blogs: [{ id: 'blog-1', title: 'Published' }],
      meta: { totalBlogs: 1, totalPages: 1, currentPage: 1, pageSize: 6 },
    });

    const result = await controller.getPublishedBlogs({
      page: 1,
      pageSize: 6,
    });

    expect(blogsService.getPublishedBlogs).toHaveBeenCalledWith({
      page: 1,
      pageSize: 6,
    });
    expect(result.meta.totalBlogs).toBe(1);
  });

  it('creates blog using authenticated request user context', async () => {
    blogsService.createBlog.mockResolvedValueOnce({
      id: 'blog-1',
      title: 'Created blog',
    });

    const dto = {
      pageTitle: 'created-blog',
      title: 'Created blog',
      excerpt: 'Excerpt',
      coverImage: 'https://example.com/cover.png',
      content: 'Content',
      tags: ['tech'],
      status: BlogStatus.DRAFT,
    };
    const req = {
      user: { id: 'writer-1', email: 'writer@example.com', role: 'writer' },
    };

    const result = await controller.createBlog(dto, req);

    expect(blogsService.createBlog).toHaveBeenCalledWith(dto, req.user);
    expect(result.id).toBe('blog-1');
  });

  it('propagates ownership errors from updateBlog service', async () => {
    blogsService.updateBlog.mockRejectedValueOnce(
      new ForbiddenException('You are not authorized to perform this action.'),
    );

    await expect(
      controller.updateBlog(
        'blog-1',
        { title: 'Updated title' },
        { user: { id: 'writer-2', email: 'writer2@example.com', role: 'writer' } },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
