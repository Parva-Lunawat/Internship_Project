import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createComment, getComments } from './commentsApi';

describe('commentsApi', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preserves server-derived comment role metadata', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comments: [{
          id: 'comment-1',
          blogId: 'blog-1',
          parentCommentId: null,
          content: 'Author comment',
          isDeleted: false,
          moderationStatus: 'visible',
          isPostAuthor: true,
          isAdmin: false,
          roleLabel: 'Author',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          deletedAt: null,
          author: {
            id: 'author-1',
            name: 'Author',
            avatar: null,
            role: 'writer',
            roleLabel: 'Author',
          },
        }],
        meta: {
          totalComments: 1,
          totalPages: 1,
          currentPage: 1,
          pageSize: 20,
        },
      }),
    });

    const result = await getComments('blog-1');

    expect(result.comments[0].isPostAuthor).toBe(true);
    expect(result.comments[0].roleLabel).toBe('Author');
    expect(result.comments[0].author?.roleLabel).toBe('Author');
  });

  it('maps forbidden comment failures to generic user-safe messages', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        message: 'Cannot POST a comment here',
      }),
    });

    await expect(createComment('blog-1', { content: 'Nope' })).rejects.toThrow(
      'You do not have permission to change this comment.',
    );
  });
});
