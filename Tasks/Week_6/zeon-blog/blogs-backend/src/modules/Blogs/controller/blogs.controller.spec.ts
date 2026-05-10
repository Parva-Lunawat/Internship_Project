import { Test, TestingModule } from '@nestjs/testing';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { BlogsController } from './blogs.controller';
import { BlogsService } from '../services/blogs.service';

function routePath(methodName: keyof BlogsController) {
  return Reflect.getMetadata(PATH_METADATA, BlogsController.prototype[methodName]);
}

function routeMethod(methodName: keyof BlogsController) {
  return Reflect.getMetadata(METHOD_METADATA, BlogsController.prototype[methodName]);
}

describe('BlogsController', () => {
  let controller: BlogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('registers publishing workflow routes before public slug lookup', () => {
    expect(routePath('publishBlog')).toBe(':id/publish');
    expect(routePath('unpublishBlog')).toBe(':id/unpublish');
    expect(routePath('scheduleBlog')).toBe(':id/schedule');
    expect(routePath('listRevisions')).toBe(':id/revisions');
    expect(routePath('restoreRevision')).toBe(':id/revisions/:revisionId/restore');
    expect(routeMethod('publishBlog')).toBe(1);
    expect(routeMethod('listRevisions')).toBe(0);
  });
});
