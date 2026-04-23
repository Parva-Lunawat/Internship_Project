import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Req,
  Body,
  Param,
  Query,
  Res,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from 'src/modules/Auth/guard/jwt-auth.guard';
import type { CurrentUser } from 'src/modules/Auth/types/current-user.type';
import { UpdateUserProfileDto } from '../dtos/update-user-profile.dto';
import { QueryUsersDto } from '../dtos/query-users.dto';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user profile',
    description:
      'Returns profile information of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUserProfile(@Req() req: { user: CurrentUser }) {
    return {
      data: await this.usersService.getCurrentUserProfile(req.user),
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update current authenticated user profile',
    description: 'Updates profile details of the currently authenticated user',
  })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateCurrentUserProfile(
    @Req() req: { user: CurrentUser },
    @Body() dto: UpdateUserProfileDto,
  ) {
    return {
      data: await this.usersService.updateCurrentUserProfile(req.user, dto),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get public user by id',
    description: 'Returns public-safe user data by internal user id',
  })
  @ApiParam({ name: 'id', description: 'Internal user UUID' })
  @ApiResponse({ status: 200, description: 'User returned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return {
      data: await this.usersService.getUserById(id),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Admin-ready endpoint to list users with filters and pagination',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search by name or email',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by role',
  })
  @ApiResponse({ status: 200, description: 'Users returned successfully' })
  async getAllUsers(
    @Req() req: { user: CurrentUser },
    @Query() queryDto: QueryUsersDto,
  ) {
    return await this.usersService.getAllUsers(queryDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user by id',
  })
  @ApiParam({ name: 'id', description: 'Internal user UUID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string, @Req() req: { user: CurrentUser }) {
    return {
      data: await this.usersService.deleteUser(id, req.user),
    };
  }
}
