import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/modules/Auth/guard/jwt-auth.guard';
import type { CurrentUser } from 'src/modules/Auth/types/current-user.type';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { QueryCommentsDto } from '../dto/query-comments.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentsService } from '../services/comments.service';

@ApiTags('Comments')
@Controller({ version: '1' })
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('blogs/:blogId/comments')
  @ApiOperation({ summary: 'List comments for a blog' })
  @ApiParam({ name: 'blogId', description: 'Blog UUID' })
  async listForBlog(@Param('blogId') blogId: string, @Query() query: QueryCommentsDto) {
    return this.commentsService.listForBlog(blogId, query);
  }

  @Post('blogs/:blogId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an authenticated comment for a blog' })
  async create(
    @Param('blogId') blogId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: { user: CurrentUser },
  ) {
    return this.commentsService.create(blogId, dto, req.user);
  }

  @Patch('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment as owner or admin' })
  async update(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: { user: CurrentUser },
  ) {
    return this.commentsService.update(commentId, dto, req.user);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a comment as owner or admin' })
  async delete(@Param('commentId') commentId: string, @Req() req: { user: CurrentUser }) {
    return this.commentsService.delete(commentId, req.user);
  }
}
