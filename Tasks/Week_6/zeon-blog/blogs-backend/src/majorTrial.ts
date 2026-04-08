// // auth.module.ts
// import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { AuthController } from './controller/auth.controller';
// import { AuthService } from './services/auth.service';
// import { User } from '../Users/entities/user.entities';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtModule } from '@nestjs/jwt';

// @Module({
//   imports: [
//     ConfigModule,
//     TypeOrmModule.forFeature([User]),
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         secret: configService.get<string>('secret') || 'dev_key',
//         signOptions: {
//           expiresIn: '1d',
//         },
//       })
//     })
//   ], 
//   controllers: [AuthController],
//   providers: [AuthService],
//   exports: [AuthService]
// })
// export class AuthModule {}

// // auth.controller.ts
// import { Controller, Get, Post, Body, Req, UseGuards, Res } from '@nestjs/common';
// import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { AuthService, CurrentUser } from '../services/auth.service';
// import { JwtAuthGuard } from '../guard/jwt-auth.guard';
// import { SignupDto } from '../dto/signup.dto';
// import { LoginDto } from '../dto/login.dto';
// import { Response } from "express";

// @Controller({
//     path: 'auth',
//     version: '1'
// })
// @ApiTags('Auth')
// export class AuthController {
//     constructor(private readonly authService: AuthService) { }

//     @Post('signup')
//     @ApiOperation({
//         summary: 'Register a new user',
//         description: 'Creates a new user account and returns an access token',
//     })
//     @ApiBody({ type: SignupDto })
//     @ApiResponse({ status: 201, description: 'Signup successful' })
//     @ApiResponse({ status: 400, description: 'Invalid signup data' })
//     async signup(@Body() dto: SignupDto) {
//         return {
//             data: await this.authService.signup(dto)
//         }
//     }

//     @Post('login')
//     @ApiOperation({
//         summary: 'Login user',
//         description: 'Authenticates a user and returns an access token',
//     })
//     @ApiBody({ type: LoginDto })
//     @ApiResponse({ status: 200, description: 'Login successful' })
//     @ApiResponse({ status: 401, description: 'Invalid credentials' })
//     async login(@Body() dto: LoginDto) {
//         return {
//             data: await this.authService.login(dto)
//         }
//     }

//     @Get('self')
//     @UseGuards(JwtAuthGuard)
//     @ApiBearerAuth()
//     @ApiOperation({
//         summary: 'Get current authenticated user',
//         description: 'Returns the currently logged-in user from JWT',
//     })
//     @ApiResponse({ status: 200, description: 'Current user returned successfully' })
//     @ApiResponse({ status: 401, description: 'Unauthorized' })
//     async self(@Req() req: { user: CurrentUser }, @Res({passthrough: true}) res: Response) {

//         res.cookie('access_token', result.accessToken, {
//             httpOnly: true,
//             secure: false, // true in production with https
//             sameSite: 'lax',
//             maxAge: 7 * 24 * 60 * 60 * 1000,
//         });

//         return {
//             data: await this.authService.self(req.user)
//         }
//     }
// }

// // blogs.module.ts
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { BlogsService } from './services/blogs.service';
// import { BlogsController } from './controller/blogs.controller';
// import { Blog } from './entities/blogs.entities';
// import { User } from '../Users/entities/user.entities';
// import { Tag } from './entities/tag.entities';
// @Module({
//   imports: [TypeOrmModule.forFeature([Blog, User, Tag])],
//   controllers: [BlogsController],
//   providers: [BlogsService],
// })
// export class BlogsModule {}

// // blogs.controller.ts
// import { Controller, UseGuards } from '@nestjs/common';
// import { Body, Get, Req, Post, Patch, Delete, Query, Param } from '@nestjs/common';
// import { CreateBlogDto } from '../dto/create-blog.dto';
// import { UpdateBlogDto } from '../dto/update-blog.dto';
// import { QueryBlogsDto } from '../dto/query-blog.dto';
// import { BlogsService } from '../services/blogs.service';
// import { Blog } from '../entities/blogs.entities';
// import type { CurrentUser } from '../services/blogs.service'
// // Swagger
// import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

// @ApiTags('Blogs')
// @Controller({
//     path: 'blogs',
//     version: '1',
// })
// export class BlogsController {
//     constructor(private readonly blogsService: BlogsService) { }

//     // Public
//     @Get()
//     @ApiOperation({
//         summary: "Fetches all Blogs available",
//         description: "Returns paginated list of published blogs with optional search and tag filtering"
//     })
//     @ApiQuery({ name: 'page', required: false, example: 1 })
//     @ApiQuery({ name: 'pageSize', required: false, example: 6 })
//     @ApiQuery({
//         name: 'query', required: false,
//         description: 'Search in title, excerpt, content, or author name'
//     })
//     @ApiQuery({ name: 'tag', required: false, description: 'Filter blogs by tag' })
//     @ApiResponse({ status: 200, description: 'List of published blogs returned successfully' })
//     async getPublishedBlogs(@Query() queryDto: QueryBlogsDto): Promise<{ blogs: Blog[], meta: any }> {
//         return await this.blogsService.getPublishedBlogs(queryDto);
//     }

//     // Writer
//     @Get('self-blogs')
//     @ApiOperation({
//         summary: "Fetches all blogs created by the current user",
//         description: "Returns paginated list of blogs created by the current user"
//     })
//     @ApiQuery({ name: 'page', required: false, example: 1 })
//     @ApiQuery({ name: 'pageSize', required: false, example: 6 })
//     @ApiQuery({
//         name: 'query', required: false,
//         description: 'Search in title, excerpt, content, or author name'
//     })
//     @ApiQuery({ name: 'tag', required: false, description: 'Filter blogs by tag' })
//     @ApiQuery({ name: 'status', required: false, description: 'Filter Blogs by Publishing Status' })
//     @ApiResponse({ status: 200, description: 'List of blogs created by the current user returned successfully' })
//     async getMyBlogs(@Query() queryDto: QueryBlogsDto, @Req() req: { user: CurrentUser }) {
//         return await this.blogsService.getMyBlogs(req.user, queryDto);
//     }

//     @Get('self-blogs/:id')
//     @ApiOperation({
//         summary: "Fetches One blogs created by the current user by id",
//         description: "Returns blog created by the current user with Id as given"
//     })
//     @ApiParam({ name: 'id', description: 'Id of the blog' })
//     @ApiResponse({ status: 200, description: 'Blog of current writer returned successfully' })
//     @ApiResponse({ status: 403, description: 'You are not allowed to access this blog' })
//     @ApiResponse({ status: 404, description: 'Blog not found' })
//     async getMyBlogsById(@Param('id') id: string, @Req() req: { user: CurrentUser }) {
//         return {
//             data: await this.blogsService.getMyBlogsById(id, req.user),
//         };
//     }

//     @Post()
//     @ApiBearerAuth()
//     @ApiOperation({
//         summary: "Creates a new blog",
//         description: "Creates a new blog with the given data"
//     })
//     @ApiBody({ type: CreateBlogDto })
//     @ApiResponse({ status: 201, description: 'Blog created successfully' })
//     @ApiResponse({ status: 400, description: 'Invalid data provided' })
//     async createBlog(@Body() createBlogDto: CreateBlogDto, @Req() req: { user: CurrentUser }) {
//         return {
//             data: await this.blogsService.createBlog(createBlogDto, req.user)
//         };
//     }

//     @Patch(':id')
//     @ApiBearerAuth()
//     @ApiOperation({ summary: 'Update a Blog', description: 'Update the Blog with given id, if user authenticated' })
//     @ApiParam({ name: 'id', description: 'Blog uuid' })
//     @ApiBody({ type: UpdateBlogDto })
//     @ApiResponse({ status: 200, description: 'Blog updated successfully' })
//     @ApiResponse({ status: 403, description: 'You are not allowed to update this blog' })
//     @ApiResponse({ status: 404, description: 'Blog not found' })
//     async updateBlog(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @Req() req: { user: CurrentUser }) {
//         return {
//             data: await this.blogsService.updateBlog(id, updateBlogDto, req.user),
//         };
//     }

//     @Delete(':id')
//     @ApiBearerAuth()
//     @ApiOperation({ summary: 'Delete a blog', description: 'Deletes a blog only if the currently authenticated writer owns it' })
//     @ApiParam({ name: 'id', description: 'Internal blog UUID' })
//     @ApiResponse({ status: 200, description: 'Blog deleted successfully' })
//     @ApiResponse({ status: 403, description: 'You are not allowed to delete this blog' })
//     @ApiResponse({ status: 404, description: 'Blog not found' })
//     async deleteBlog(@Param('id') id: string, @Req() req: { user: CurrentUser }) {
//         return await this.blogsService.deleteBlog(id, req.user);
//     }

//     // Public but precedence issue
//     @Get(':pageTitle')
//     @ApiOperation({
//         summary: "Fetches a single published blog by pageTitle",
//         description: "Returns a single published blog by pageTitle"
//     })
//     @ApiParam({ name: 'pageTitle', required: true, example: 'my-first-blog' })
//     @ApiResponse({ status: 200, description: 'Published blog returned successfully' })
//     async getPublishedBlogByPageTitle(@Param('pageTitle') pageTitle: string): Promise<Blog> {
//         return await this.blogsService.getPublishedBlogByPageTitle(pageTitle);
//     }
// }

// // jwt-auth.guard.ts
// import { Injectable } from "@nestjs/common";
// import { AuthGuard } from "@nestjs/passport";

// // to protect routes with this method
// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}

// //jwt.strategy.ts
// import { Injectable } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { ExtractJwt, Strategy } from "passport-jwt";
// import { ConfigService } from "@nestjs/config";
// import type { CurrentUser } from "../services/auth.service";
// import { Request } from "express";

// type JwtPayload = {
//     userId: string;
//     email: string;
//     role: string;
// }

// const cookieExtractor = (req: Request): string | null => {
//   if (req && req.cookies) {
//     return req.cookies['access_token'] || null;
//   }
//   return null;
// };

// // Tells how to extract and convert into usable object for verification
// @Injectable() 
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(configService: ConfigService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         ExtractJwt.fromAuthHeaderAsBearerToken(),
//         cookieExtractor
//       ]),
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>('JWT_SECRET') || 'dev-secret',
//     });
//   }

//   async validate(payload: JwtPayload): Promise<CurrentUser> {
//     return {
//       id: payload.userId,
//       email: payload.email,
//       role: payload.role,
//     };
//   }
// }
