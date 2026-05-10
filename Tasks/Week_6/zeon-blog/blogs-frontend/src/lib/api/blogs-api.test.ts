import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createBlog,
  deleteMyBlog,
  getPublishedPostByPageTitle,
  listBlogRevisions,
  publishMyBlog,
  restoreBlogRevision,
  scheduleMyBlog,
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
        featuredImageAlt: 'Cover description',
        content: 'Markdown content',
        tags: [],
        publishedAt: '2026-04-24T00:00:00.000Z',
        scheduledPublishAt: null,
        readingTimeMinutes: 3,
        metaTitle: 'Meta title',
        metaDescription: 'Meta description',
        canonicalPath: '/blogs/new-blog',
        visibility: 'public',
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
      featuredImageAlt: 'Cover description',
      visibility: 'public',
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
    expect(result.readingTimeMinutes).toBe(3);
    expect(result.canonicalPath).toBe('/blogs/new-blog');
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
        scheduledPublishAt: null,
        readingTimeMinutes: 1,
        featuredImageAlt: null,
        metaTitle: null,
        metaDescription: null,
        canonicalPath: '/blogs/new-blog',
        visibility: 'public',
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

  it('publishes, schedules, lists revisions, and restores through workflow endpoints', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'blog-1',
          pageTitle: 'new-blog',
          title: 'Published',
          excerpt: 'Useful excerpt',
          coverImage: 'https://example.com/cover.png',
          content: 'Markdown content',
          tags: [],
          publishedAt: '2026-04-24T00:00:00.000Z',
          scheduledPublishAt: null,
          readingTimeMinutes: 1,
          featuredImageAlt: null,
          metaTitle: null,
          metaDescription: null,
          canonicalPath: '/blogs/new-blog',
          visibility: 'public',
          status: 'published',
          author: { id: 'writer-1', name: 'Parva', avatar: null },
          createdAt: '2026-04-24T00:00:00.000Z',
          updatedAt: '2026-04-24T00:00:00.000Z',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'blog-1',
          pageTitle: 'new-blog',
          title: 'Scheduled',
          excerpt: 'Useful excerpt',
          coverImage: 'https://example.com/cover.png',
          content: 'Markdown content',
          tags: [],
          publishedAt: null,
          scheduledPublishAt: '2026-04-25T00:00:00.000Z',
          readingTimeMinutes: 1,
          featuredImageAlt: null,
          metaTitle: null,
          metaDescription: null,
          canonicalPath: '/blogs/new-blog',
          visibility: 'public',
          status: 'scheduled',
          author: { id: 'writer-1', name: 'Parva', avatar: null },
          createdAt: '2026-04-24T00:00:00.000Z',
          updatedAt: '2026-04-24T00:00:00.000Z',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          revisions: [{ id: 'rev-1', blogId: 'blog-1', action: 'publish', title: 'Published' }],
          meta: { total: 1, limit: 50 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'blog-1',
          pageTitle: 'new-blog',
          title: 'Restored',
          excerpt: 'Useful excerpt',
          coverImage: 'https://example.com/cover.png',
          content: 'Markdown content',
          tags: [],
          publishedAt: null,
          scheduledPublishAt: null,
          readingTimeMinutes: 1,
          featuredImageAlt: null,
          metaTitle: null,
          metaDescription: null,
          canonicalPath: '/blogs/new-blog',
          visibility: 'public',
          status: 'draft',
          author: { id: 'writer-1', name: 'Parva', avatar: null },
          createdAt: '2026-04-24T00:00:00.000Z',
          updatedAt: '2026-04-24T00:00:00.000Z',
        }),
      });

    await publishMyBlog('blog-1');
    await scheduleMyBlog('blog-1', '2026-04-25T00:00:00.000Z');
    const revisions = await listBlogRevisions('blog-1');
    await restoreBlogRevision('blog-1', 'rev-1');

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:5000/api/v1/blogs/blog-1/publish', expect.objectContaining({ method: 'POST' }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:5000/api/v1/blogs/blog-1/schedule', expect.objectContaining({ method: 'POST' }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'http://localhost:5000/api/v1/blogs/blog-1/revisions', expect.objectContaining({ method: 'GET' }));
    expect(fetchMock).toHaveBeenNthCalledWith(4, 'http://localhost:5000/api/v1/blogs/blog-1/revisions/rev-1/restore', expect.objectContaining({ method: 'POST' }));
    expect(revisions.meta.total).toBe(1);
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

  it('normalizes legacy blog payloads without crashing the UI', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'blog-legacy',
        pageTitle: 'legacy-post',
        title: 'Legacy Post',
        excerpt: null,
        coverImage: null,
        content: null,
        publishedAt: 'not-a-date',
        status: null,
        createdAt: '2026-04-24T00:00:00.000Z',
        updatedAt: '2026-04-24T00:00:00.000Z',
      }),
    });

    const result = await getPublishedPostByPageTitle('legacy-post');

    expect(result.tags).toEqual([]);
    expect(result.author.name).toBe('Zeon Team');
    expect(result.publishedAt).toBeNull();
    expect(result.status).toBe('draft');
    expect(result.content).toBe('');
  });
});
