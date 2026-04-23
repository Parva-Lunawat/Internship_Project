import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createBlog,
  deleteMyBlog,
  updateMyBlog,
} from './blogsApi';

describe('blogsApi integration-ish flows', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a blog through POST /blogs with cookie credentials', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'blog-1',
        pageTitle: 'new-blog',
        title: 'New Blog',
        excerpt: 'Useful excerpt',
        coverImage: 'https://example.com/cover.png',
        content: 'Markdown content',
        tags: [],
        publishedAt: '2026-04-24T00:00:00.000Z',
        status: 'draft',
        author: { id: 'writer-1', name: 'Parva', avatar: null },
        createdAt: '2026-04-24T00:00:00.000Z',
        updatedAt: '2026-04-24T00:00:00.000Z',
      }),
    });

    const result = await createBlog({
      pageTitle: 'new-blog',
      title: 'New Blog',
      excerpt: 'Useful excerpt',
      coverImage: 'https://example.com/cover.png',
      content: 'Markdown content',
      tags: ['tech'],
      status: 'draft',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/blogs',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
    expect(result.pageTitle).toBe('new-blog');
    expect(result.publishedAt).toBe('2026-04-24');
  });

  it('updates a blog through PATCH /blogs/:id', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'blog-1',
        pageTitle: 'new-blog',
        title: 'Updated title',
        excerpt: 'Useful excerpt',
        coverImage: 'https://example.com/cover.png',
        content: 'Markdown content',
        tags: [],
        publishedAt: null,
        status: 'draft',
        author: { id: 'writer-1', name: 'Parva', avatar: null },
        createdAt: '2026-04-24T00:00:00.000Z',
        updatedAt: '2026-04-24T00:00:00.000Z',
      }),
    });

    const result = await updateMyBlog('blog-1', {
      title: 'Updated title',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/blogs/blog-1',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
      }),
    );
    expect(result.title).toBe('Updated title');
  });

  it('deletes a blog through DELETE /blogs/:id', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        deleted: true,
        id: 'blog-1',
      }),
    });

    const result = await deleteMyBlog('blog-1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/blogs/blog-1',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
      }),
    );
    expect(result).toEqual({ deleted: true, id: 'blog-1' });
  });
});
