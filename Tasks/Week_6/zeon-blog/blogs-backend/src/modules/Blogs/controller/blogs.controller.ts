import {
  Controller,
  UseGuards,
  Body,
  Get,
  Req,
  Post,
  Patch,
  Delete,
  Query,
  Param,
} from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { QueryBlogsDto } from '../dto/query-blog.dto';
import { ScheduleBlogDto } from '../dto/schedule-blog.dto';
import { BlogsService } from '../services/blogs.service';
import { Blog } from '../entities/blogs.entities';
import { JwtAuthGuard } from 'src/modules/Auth/guard/jwt-auth.guard';
import type { CurrentUser } from 'src/modules/Auth/types/current-user.type';
// Swagger
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Blogs')
@Controller({
  path: 'blogs',
  version: '1',
})
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  // Public
  @Get()
  @ApiOperation({
    summary: 'Fetches all Blogs available',
    description:
      'Returns paginated list of published blogs with optional search and tag filtering',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 6 })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search in title, excerpt, content, or author name',
  })
  @ApiQuery({
    name: 'tag',
    required: false,
    description: 'Filter blogs by tag',
  })
  @ApiResponse({
    status: 200,
    description: 'List of published blogs returned successfully',
  })
  async getPublishedBlogs(@Query() queryDto: QueryBlogsDto) {
    return await this.blogsService.getPublishedBlogs(queryDto);
  }

  // Writer
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Fetches all blogs created by the current user',
    description: 'Returns paginated list of blogs created by the current user',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 6 })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search in title, excerpt, content, or author name',
  })
  @ApiQuery({
    name: 'tag',
    required: false,
    description: 'Filter blogs by tag',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter Blogs by Publishing Status',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of blogs created by the current user returned successfully',
  })
  async getMyBlogs(
    @Query() queryDto: QueryBlogsDto,
    @Req() req: { user: CurrentUser },
  ) {
    return await this.blogsService.getMyBlogs(req.user, queryDto);
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Fetches One blogs created by the current user by id',
    description: 'Returns blog created by the current user with Id as given',
  })
  @ApiParam({ name: 'id', description: 'Id of the blog' })
  @ApiResponse({
    status: 200,
    description: 'Blog of current writer returned successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to access this blog',
  })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  async getMyBlogsById(
    @Param('id') id: string,
    @Req() req: { user: CurrentUser },
  ) {
    return await this.blogsService.getMyBlogsById(id, req.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Creates a new blog',
    description: 'Creates a new blog with the given data',
  })
  @ApiBody({ type: CreateBlogDto })
  @ApiResponse({ status: 201, description: 'Blog created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @Req() req: { user: CurrentUser },
  ) {
    return await this.blogsService.createBlog(createBlogDto, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a Blog',
    description: 'Update the Blog with given id, if user authenticated',
  })
  @ApiParam({ name: 'id', description: 'Blog uuid' })
  @ApiBody({ type: UpdateBlogDto })
  @ApiResponse({ status: 200, description: 'Blog updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to update this blog',
  })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Req() req: { user: CurrentUser },
  ) {
    return await this.blogsService.updateBlog(id, updateBlogDto, req.user);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish a managed blog',
    description: 'Moves a draft or scheduled blog into the published state.',
  })
  @ApiParam({ name: 'id', description: 'Blog uuid' })
  @ApiResponse({ status: 200, description: 'Blog published successfully' })
  async publishBlog(@Param('id') id: string, @Req() req: { user: CurrentUser }) {
    return await this.blogsService.publishBlog(id, req.user);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unpublish a managed blog',
    description: 'Moves a published or scheduled blog back to draft.',
  })
  @ApiParam({ name: 'id', description: 'Blog uuid' })
  @ApiResponse({ status: 200, description: 'Blog unpublished successfully' })
  async unpublishBlog(@Param('id') id: string, @Req() req: { user: CurrentUser }) {
    return await this.blogsService.unpublishBlog(id, req.user);
  }

  @Post(':id/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Schedule a managed blog',
    description: 'Stores a future publish time and moves the blog to scheduled.',
  })
  @ApiParam({ name: 'id', description: 'Blog uuid' })
  @ApiBody({ type: ScheduleBlogDto })
  @ApiResponse({ status: 200, description: 'Blog scheduled successfully' })
  async scheduleBlog(
    @Param('id') id: string,
    @Body() scheduleBlogDto: ScheduleBlogDto,
    @Req() req: { user: CurrentUser },
  ) {
    return await this.blogsService.scheduleBlog(id, scheduleBlogDto, req.user);
  }

  @Get(':id/revisions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List safe revision metadata for a managed blog',
  })
  @ApiParam({ name: 'id', description: 'Blog uuid' })
  @ApiResponse({ status: 200, description: 'Blog revisions returned successfully' })
  async listRevisions(@Param('id') id: string, @Req() req: { user: CurrentUser }) {
    return await this.blogsService.listRevisions(id, req.user);
  }

  @Post(':id/revisions/:revisionId/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore a managed blog from a revision',
  })
  @ApiParam({ name: 'id', description: 'Blog uuid' })
  @ApiParam({ name: 'revisionId', description: 'Revision uuid' })
  @ApiResponse({ status: 200, description: 'Blog revision restored successfully' })
  async restoreRevision(
    @Param('id') id: string,
    @Param('revisionId') revisionId: string,
    @Req() req: { user: CurrentUser },
  ) {
    return await this.blogsService.restoreRevision(id, revisionId, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a blog',
    description:
      'Deletes a blog only if the currently authenticated writer owns it',
  })
  @ApiParam({ name: 'id', description: 'Internal blog UUID' })
  @ApiResponse({ status: 200, description: 'Blog deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to delete this blog',
  })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  async deleteBlog(@Param('id') id: string, @Req() req: { user: CurrentUser }) {
    return await this.blogsService.deleteBlog(id, req.user);
  }

  // Public but precedence issue
  @Get(':pageTitle')
  @ApiOperation({
    summary: 'Fetches a single published blog by pageTitle',
    description: 'Returns a single published blog by pageTitle',
  })
  @ApiParam({ name: 'pageTitle', required: true, example: 'my-first-blog' })
  @ApiResponse({
    status: 200,
    description: 'Published blog returned successfully',
  })
  async getPublishedBlogByPageTitle(@Param('pageTitle') pageTitle: string) {
    return await this.blogsService.getPublishedBlogByPageTitle(pageTitle);
  }
}
