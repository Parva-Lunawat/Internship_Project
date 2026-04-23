import { ForbiddenException } from '@nestjs/common';
import { BlogStatus } from '../entities/blogs.entities';

jest.mock(
  'src/modules/Users/entities/user.entities',
  () => ({ User: class User {} }),
  { virtual: true },
);

const { BlogsService } = require('./blogs.service');

describe('BlogsService', () => {
  let service: InstanceType<typeof BlogsService>;
  let blogsRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    blogsRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const tagsRepository = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    const userRepository = {
      findOne: jest.fn(),
    };
    service = new BlogsService(
      blogsRepository as any,
      tagsRepository as any,
      userRepository as any,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('keeps publishedAt when published status remains published', () => {
    const publishedAt = new Date('2026-01-10T10:00:00.000Z');
    const result = (service as any).applyPublishedAtOnUpdate(
      { status: BlogStatus.PUBLISHED, publishedAt } as any,
      BlogStatus.PUBLISHED,
    );

    expect(result).toBe(publishedAt);
  });

  it('clears publishedAt when status changes from published to draft', () => {
    const result = (service as any).applyPublishedAtOnUpdate(
      { status: BlogStatus.PUBLISHED, publishedAt: new Date() } as any,
      BlogStatus.DRAFT,
    );

    expect(result).toBeNull();
  });

  it('allows admin to fetch non-owned blog', async () => {
    blogsRepository.findOne.mockResolvedValue({
      id: 'blog-1',
      author: { id: 'writer-1', name: 'Writer', avatar: null },
      tags: [],
    });

    await service.getMyBlogsById('blog-1', {
      id: 'admin-1',
      email: 'admin@example.com',
      role: 'admin',
    });

    expect(blogsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'blog-1' },
      relations: { author: true, tags: true },
    });
  });

  it('rejects writer fetching another writer blog', async () => {
    blogsRepository.findOne.mockResolvedValue({
      id: 'blog-1',
      author: { id: 'writer-1', name: 'Writer', avatar: null },
      tags: [],
    });

    await expect(
      service.getMyBlogsById('blog-1', {
        id: 'writer-2',
        email: 'writer2@example.com',
        role: 'writer',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
