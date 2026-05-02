import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MyBlogsPage from './page';

const pushMock = vi.fn();
const getMyBlogsMock = vi.fn();

let currentSearchParams: Record<string, string> = {};

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => ({
    get: (key: string) => currentSearchParams[key] ?? null,
    toString: () => new URLSearchParams(currentSearchParams).toString(),
  }),
}));

vi.mock('@/src/lib/api/blogsApi', () => ({
  getMyBlogs: (...args: unknown[]) => getMyBlogsMock(...args),
  deleteMyBlog: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: (props: { href: string; children: React.ReactNode }) => (
    <a href={props.href}>{props.children}</a>
  ),
}));

describe('MyBlogsPage', () => {
  beforeEach(() => {
    pushMock.mockReset();
    getMyBlogsMock.mockReset();
    currentSearchParams = {};
  });

  it('renders blog cards when API returns blog data', async () => {
    getMyBlogsMock.mockResolvedValueOnce({
      blogs: [
        {
          id: 'blog-1',
          pageTitle: 'first-blog',
          title: 'First Blog',
          excerpt: 'Blog excerpt',
          coverImage: 'https://example.com/cover.png',
          content: 'Content',
          tags: [],
          publishedAt: null,
          status: 'draft',
          author: { id: 'author-1', name: 'Parva', avatar: null },
          createdAt: '2026-04-24T00:00:00.000Z',
          updatedAt: '2026-04-24T00:00:00.000Z',
        },
      ],
      meta: {
        totalBlogs: 1,
        totalPages: 1,
        currentPage: 1,
        pageSize: 6,
      },
    });

    render(<MyBlogsPage />);

    await waitFor(() => {
      expect(getMyBlogsMock).toHaveBeenCalled();
    });
    expect(await screen.findByText('First Blog')).toBeInTheDocument();
  });

  it('renders empty state when API returns no blogs', async () => {
    getMyBlogsMock.mockResolvedValueOnce({
      blogs: [],
      meta: {
        totalBlogs: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 6,
      },
    });

    render(<MyBlogsPage />);

    expect(await screen.findByText('No results')).toBeInTheDocument();
    expect(
      screen.getByText("You haven't created any posts matching your search."),
    ).toBeInTheDocument();
  });
});
