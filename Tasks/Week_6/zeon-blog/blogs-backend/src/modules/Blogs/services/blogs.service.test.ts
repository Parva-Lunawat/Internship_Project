import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BlogStatus } from '../entities/blogs.entities';
import { BlogsService } from './blogs.service';

type QueryBuilderStub = {
  leftJoinAndSelect: ReturnType<typeof vi.fn>;
  leftJoin: ReturnType<typeof vi.fn>;
  addSelect: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  andWhere: ReturnType<typeof vi.fn>;
  orderBy: ReturnType<typeof vi.fn>;
  addOrderBy: ReturnType<typeof vi.fn>;
  skip: ReturnType<typeof vi.fn>;
  take: ReturnType<typeof vi.fn>;
  getManyAndCount: ReturnType<typeof vi.fn>;
  getOne: ReturnType<typeof vi.fn>;
};

function makeQueryBuilder(): QueryBuilderStub {
  const qb = {
    leftJoinAndSelect: vi.fn(),
    leftJoin: vi.fn(),
    addSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    orderBy: vi.fn(),
    addOrderBy: vi.fn(),
    skip: vi.fn(),
    take: vi.fn(),
    getManyAndCount: vi.fn(),
    getOne: vi.fn(),
  } as QueryBuilderStub;

  qb.leftJoinAndSelect.mockReturnValue(qb);
  qb.leftJoin.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  qb.orderBy.mockReturnValue(qb);
  qb.addOrderBy.mockReturnValue(qb);
  qb.skip.mockReturnValue(qb);
  qb.take.mockReturnValue(qb);
  return qb;
}

describe('BlogsService (vitest)', () => {
  let service: BlogsService;
  let blogsRepository: {
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };
  let tagsRepository: {
    find: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let userRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    blogsRepository = {
      findOne: vi.fn(),
      create: vi.fn((input) => ({ id: 'blog-1', ...input })),
      save: vi.fn(async (input) => input),
      remove: vi.fn(async (input) => input),
      createQueryBuilder: vi.fn(),
    };
    tagsRepository = {
      find: vi.fn(),
      create: vi.fn((input) => ({ id: `tag-${input.name}`, ...input })),
      save: vi.fn(async (input) => input),
    };
    userRepository = {
      findOne: vi.fn(),
    };

    service = new BlogsService(
      blogsRepository as any,
      tagsRepository as any,
      userRepository as any,
    );
  });

  it('fetches published blogs with pagination metadata', async () => {
    const qb = makeQueryBuilder();
    blogsRepository.createQueryBuilder.mockReturnValue(qb);
    qb.getManyAndCount.mockResolvedValue([
      [
        {
          id: 'blog-1',
          title: 'First blog',
          pageTitle: 'first-blog',
          excerpt: 'excerpt',
          coverImage: 'https://example.com/cover.png',
          content: 'content',
          status: BlogStatus.PUBLISHED,
          publishedAt: new Date('2026-04-10T00:00:00.000Z'),
          createdAt: new Date('2026-04-09T00:00:00.000Z'),
          updatedAt: new Date('2026-04-10T00:00:00.000Z'),
          tags: [],
          author: {
            id: 'author-1',
            name: 'Parva',
            avatar: null,
            email: 'private@example.com',
          },
        },
      ],
      1,
    ]);

    const response = await service.getPublishedBlogs({
      page: 1,
      pageSize: 6,
    });

    expect(response.meta.totalBlogs).toBe(1);
    expect(response.meta.totalPages).toBe(1);
    expect(response.blogs[0].author).toEqual({
      id: 'author-1',
      name: 'Parva',
      avatar: null,
    });
  });

  it('rejects duplicate pageTitle on create', async () => {
    blogsRepository.findOne.mockResolvedValueOnce({
      id: 'existing-blog',
      pageTitle: 'my-post',
    });

    await expect(
      service.createBlog(
        {
          pageTitle: 'my-post',
          title: 'Title',
          excerpt: 'Excerpt',
          coverImage: 'https://example.com/cover.png',
          content: 'Content',
          tags: ['tech'],
          status: BlogStatus.DRAFT,
        },
        {
          id: 'user-1',
          email: 'writer@example.com',
          role: 'writer',
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates blog with resolved tags and normalized fields', async () => {
    blogsRepository.findOne.mockResolvedValueOnce(null);
    userRepository.findOne.mockResolvedValueOnce({
      id: 'writer-1',
      name: 'Parva',
    });
    tagsRepository.find.mockResolvedValueOnce([{ id: 'tag-tech', name: 'tech' }]);
    tagsRepository.save.mockResolvedValueOnce([{ id: 'tag-guides', name: 'guides' }]);
    blogsRepository.save.mockImplementationOnce(async (blog) => blog);

    const response = await service.createBlog(
      {
        pageTitle: '  My New Post  ',
        title: '  New Blog Title  ',
        excerpt: '  Useful excerpt  ',
        coverImage: '  https://example.com/image.png  ',
        content: '  Content body  ',
        tags: ['Tech', 'Guides', 'tech'],
        status: BlogStatus.PUBLISHED,
      },
      {
        id: 'writer-1',
        email: 'writer@example.com',
        role: 'writer',
      },
    );

    expect(response.pageTitle).toBe('my new post');
    expect(response.tags.map((tag: { name: string }) => tag.name).sort()).toEqual(
      ['guides', 'tech'],
    );
    expect(response.status).toBe(BlogStatus.PUBLISHED);
    expect(response.publishedAt).toBeInstanceOf(Date);
  });

  it('rejects update when current user is not owner or admin', async () => {
    blogsRepository.findOne.mockResolvedValueOnce({
      id: 'blog-1',
      title: 'Original',
      pageTitle: 'original',
      excerpt: 'excerpt',
      coverImage: 'https://example.com/cover.png',
      content: 'content',
      status: BlogStatus.DRAFT,
      publishedAt: null,
      tags: [],
      author: { id: 'owner-1', name: 'Owner', avatar: null },
    });

    await expect(
      service.updateBlog(
        'blog-1',
        { title: 'Changed Title' },
        {
          id: 'other-user',
          email: 'other@example.com',
          role: 'writer',
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects delete when current user is not owner or admin', async () => {
    blogsRepository.findOne.mockResolvedValueOnce({
      id: 'blog-1',
      title: 'Original',
      author: { id: 'owner-1', name: 'Owner', avatar: null },
    });

    await expect(
      service.deleteBlog('blog-1', {
        id: 'other-user',
        email: 'other@example.com',
        role: 'writer',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
