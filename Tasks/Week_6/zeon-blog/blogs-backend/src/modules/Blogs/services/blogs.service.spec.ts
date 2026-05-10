import { ForbiddenException } from '@nestjs/common';
import { BlogStatus, BlogVisibility } from '../entities/blogs.entities';

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
  let revisionsRepository: {
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    blogsRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    revisionsRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((value) => value),
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
    const commentsRepository = {};
    service = new BlogsService(
      blogsRepository as any,
      revisionsRepository as any,
      tagsRepository as any,
      userRepository as any,
      commentsRepository as any,
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

  it('calculates a minimum one-minute reading time', () => {
    expect((service as any).calculateReadingTime('short post')).toBe(1);
  });

  it('requires scheduled publish time to be in the future', () => {
    expect(() =>
      (service as any).resolvePublishingFields(null, BlogStatus.SCHEDULED),
    ).toThrow('Scheduled posts require a future publish time.');
  });

  it('resolves relative canonical paths', () => {
    expect((service as any).resolveCanonicalPath('custom-path', 'hello-world')).toBe('/custom-path');
    expect((service as any).resolveCanonicalPath(undefined, 'hello-world')).toBe('/blogs/hello-world');
  });

  it('rejects absolute canonical paths', () => {
    expect(() =>
      (service as any).resolveCanonicalPath('https://example.test/post', 'hello-world'),
    ).toThrow('Canonical path must be relative.');
  });

  it('allows admin to fetch non-owned blog', async () => {
    blogsRepository.findOne.mockResolvedValue({
      id: 'blog-1',
      author: { id: 'writer-1', name: 'Writer', avatar: null },
      tags: [],
      visibility: BlogVisibility.PUBLIC,
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

  it('publishes a managed blog and records a revision', async () => {
    blogsRepository.findOne.mockResolvedValue({
      id: 'blog-1',
      pageTitle: 'first-blog',
      title: 'First Blog',
      excerpt: 'Excerpt',
      coverImage: 'cover.png',
      content: 'Content',
      status: BlogStatus.DRAFT,
      visibility: BlogVisibility.PUBLIC,
      publishedAt: null,
      scheduledPublishAt: null,
      readingTimeMinutes: 1,
      author: { id: 'writer-1', name: 'Writer', avatar: null },
      tags: [],
    });
    blogsRepository.save.mockImplementation(async (value) => value);

    const result = await service.publishBlog('blog-1', {
      id: 'writer-1',
      email: 'writer@example.com',
      role: 'writer',
    });

    expect(result.status).toBe(BlogStatus.PUBLISHED);
    expect(result.publishedAt).toBeInstanceOf(Date);
    expect(revisionsRepository.save).toHaveBeenCalled();
  });

  it('schedules a managed blog for a future publish time', async () => {
    blogsRepository.findOne.mockResolvedValue({
      id: 'blog-1',
      pageTitle: 'first-blog',
      title: 'First Blog',
      excerpt: 'Excerpt',
      coverImage: 'cover.png',
      content: 'Content',
      status: BlogStatus.DRAFT,
      visibility: BlogVisibility.PUBLIC,
      publishedAt: null,
      scheduledPublishAt: null,
      readingTimeMinutes: 1,
      author: { id: 'writer-1', name: 'Writer', avatar: null },
      tags: [],
    });
    blogsRepository.save.mockImplementation(async (value) => value);
    const future = new Date(Date.now() + 3_600_000).toISOString();

    const result = await service.scheduleBlog('blog-1', { scheduledPublishAt: future }, {
      id: 'writer-1',
      email: 'writer@example.com',
      role: 'writer',
    });

    expect(result.status).toBe(BlogStatus.SCHEDULED);
    expect(result.scheduledPublishAt).toBeInstanceOf(Date);
    expect(revisionsRepository.save).toHaveBeenCalled();
  });

  it('returns safe revision metadata without content snapshots', async () => {
    blogsRepository.findOne.mockResolvedValue({
      id: 'blog-1',
      author: { id: 'writer-1', name: 'Writer', avatar: null },
      tags: [],
    });
    revisionsRepository.findAndCount.mockResolvedValue([
      [{
        id: 'revision-1',
        blogId: 'blog-1',
        action: 'publish',
        title: 'First Blog',
        pageTitle: 'first-blog',
        status: BlogStatus.PUBLISHED,
        visibility: BlogVisibility.PUBLIC,
        readingTimeMinutes: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        editor: { id: 'writer-1', name: 'Writer', email: 'private@example.com' },
      }],
      1,
    ]);

    const result = await service.listRevisions('blog-1', {
      id: 'writer-1',
      email: 'writer@example.com',
      role: 'writer',
    });

    expect(result.revisions[0]).not.toHaveProperty('content');
    expect(result.revisions[0].editor).toEqual({ id: 'writer-1', name: 'Writer' });
  });
});
