import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from 'src/modules/Auth/guard/jwt-auth.guard';
import { BlogsService } from '../services/blogs.service';
import { BlogsController } from './blogs.controller';

class TestJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth) {
      throw new UnauthorizedException('No token found');
    }

    req.user = {
      id: 'writer-1',
      email: 'writer@example.com',
      role: 'writer',
    };
    return true;
  }
}

describe('BlogsController (vitest)', () => {
  let app: INestApplication;
  const blogsService = {
    getPublishedBlogs: vi.fn(),
    getPublishedBlogByPageTitle: vi.fn(),
    getMyBlogs: vi.fn(),
    getMyBlogsById: vi.fn(),
    createBlog: vi.fn(),
    updateBlog: vi.fn(),
    deleteBlog: vi.fn(),
  };

  beforeEach(async () => {
    Object.values(blogsService).forEach((fn) => fn.mockReset());

    const moduleRef = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        { provide: BlogsService, useValue: blogsService },
        { provide: JwtAuthGuard, useClass: TestJwtAuthGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns published blogs for GET /v1/blogs', async () => {
    blogsService.getPublishedBlogs.mockResolvedValue({
      blogs: [{ id: 'blog-1', title: 'Published' }],
      meta: { totalBlogs: 1, totalPages: 1, currentPage: 1, pageSize: 6 },
    });

    const response = await request(app.getHttpServer())
      .get('/v1/blogs?page=1&pageSize=6')
      .expect(200);

    expect(response.body.meta.totalBlogs).toBe(1);
    expect(blogsService.getPublishedBlogs).toHaveBeenCalled();
  });

  it('requires authentication for POST /v1/blogs', async () => {
    await request(app.getHttpServer())
      .post('/v1/blogs')
      .send({
        pageTitle: 'new-blog',
        title: 'New Blog',
        excerpt: 'Useful excerpt',
        coverImage: 'https://example.com/cover.png',
        content: 'Markdown content',
        tags: ['tech'],
        status: 'draft',
      })
      .expect(401);
  });

  it('returns forbidden when PATCH /v1/blogs/:id fails ownership', async () => {
    blogsService.updateBlog.mockRejectedValueOnce(
      new ForbiddenException('You are not authorized to perform this action.'),
    );

    await request(app.getHttpServer())
      .patch('/v1/blogs/blog-1')
      .set('Authorization', 'Bearer test-token')
      .send({ title: 'Updated title' })
      .expect(403);
  });
});
