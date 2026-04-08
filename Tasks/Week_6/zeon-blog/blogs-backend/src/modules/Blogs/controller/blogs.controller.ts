import { Controller, UseGuards, Body, Get, Req, Post, Patch, Delete, Query, Param } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { QueryBlogsDto } from '../dto/query-blog.dto';
import { BlogsService } from '../services/blogs.service';
import { Blog } from '../entities/blogs.entities';
import { JwtAuthGuard } from 'src/modules/Auth/guard/jwt-auth.guard';
import type { CurrentUser } from 'src/modules/Auth/types/current-user.type';
// Swagger
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Blogs')
@Controller({
    path: 'blogs',
    version: '1',
})
export class BlogsController {
    constructor(private readonly blogsService: BlogsService) { }

    // Public
    @Get()
    @ApiOperation({
        summary: "Fetches all Blogs available",
        description: "Returns paginated list of published blogs with optional search and tag filtering"
    })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, example: 6 })
    @ApiQuery({
        name: 'query', required: false,
        description: 'Search in title, excerpt, content, or author name'
    })
    @ApiQuery({ name: 'tag', required: false, description: 'Filter blogs by tag' })
    @ApiResponse({ status: 200, description: 'List of published blogs returned successfully' })
    async getPublishedBlogs(@Query() queryDto: QueryBlogsDto) {
        return await this.blogsService.getPublishedBlogs(queryDto);
    }

    // Writer
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Fetches all blogs created by the current user",
        description: "Returns paginated list of blogs created by the current user"
    })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, example: 6 })
    @ApiQuery({
        name: 'query', required: false,
        description: 'Search in title, excerpt, content, or author name'
    })
    @ApiQuery({ name: 'tag', required: false, description: 'Filter blogs by tag' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter Blogs by Publishing Status' })
    @ApiResponse({ status: 200, description: 'List of blogs created by the current user returned successfully' })
    async getMyBlogs(@Query() queryDto: QueryBlogsDto, @Req() req: { user: CurrentUser }) {
        return await this.blogsService.getMyBlogs(req.user, queryDto);
    }

    @Get('me/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Fetches One blogs created by the current user by id",
        description: "Returns blog created by the current user with Id as given"
    })
    @ApiParam({ name: 'id', description: 'Id of the blog' })
    @ApiResponse({ status: 200, description: 'Blog of current writer returned successfully' })
    @ApiResponse({ status: 403, description: 'You are not allowed to access this blog' })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    async getMyBlogsById(@Param('id') id: string, @Req() req: { user: CurrentUser }) {
        return await this.blogsService.getMyBlogsById(id, req.user);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Creates a new blog",
        description: "Creates a new blog with the given data"
    })
    @ApiBody({ type: CreateBlogDto })
    @ApiResponse({ status: 201, description: 'Blog created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data provided' })
    async createBlog(@Body() createBlogDto: CreateBlogDto, @Req() req: { user: CurrentUser }) {
        return await this.blogsService.createBlog(createBlogDto, req.user);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a Blog', description: 'Update the Blog with given id, if user authenticated' })
    @ApiParam({ name: 'id', description: 'Blog uuid' })
    @ApiBody({ type: UpdateBlogDto })
    @ApiResponse({ status: 200, description: 'Blog updated successfully' })
    @ApiResponse({ status: 403, description: 'You are not allowed to update this blog' })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    async updateBlog(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @Req() req: { user: CurrentUser }) {
        return await this.blogsService.updateBlog(id, updateBlogDto, req.user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a blog', description: 'Deletes a blog only if the currently authenticated writer owns it' })
    @ApiParam({ name: 'id', description: 'Internal blog UUID' })
    @ApiResponse({ status: 200, description: 'Blog deleted successfully' })
    @ApiResponse({ status: 403, description: 'You are not allowed to delete this blog' })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    async deleteBlog(@Param('id') id: string, @Req() req: { user: CurrentUser }) {
        return await this.blogsService.deleteBlog(id, req.user);
    }

    // Public but precedence issue
    @Get(':pageTitle')
    @ApiOperation({
        summary: "Fetches a single published blog by pageTitle",
        description: "Returns a single published blog by pageTitle"
    })
    @ApiParam({ name: 'pageTitle', required: true, example: 'my-first-blog' })
    @ApiResponse({ status: 200, description: 'Published blog returned successfully' })
    async getPublishedBlogByPageTitle(@Param('pageTitle') pageTitle: string) {
        return await this.blogsService.getPublishedBlogByPageTitle(pageTitle);
    }
}
