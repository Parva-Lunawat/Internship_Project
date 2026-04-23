// import {
//   BadRequestException,
//   ForbiddenException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { In, Repository } from 'typeorm';

// import { Blog } from '../entities/blog.entity';
// import { Tag } from '../entities/tag.entity';
// import { User } from '../../users/entities/user.entity';

// import { CreateBlogDto, BlogStatus } from '../dto/create-blog.dto';
// import { UpdateBlogDto } from '../dto/update-blog.dto';
// import { QueryBlogsDto } from '../dto/query-blogs.dto';

// type CurrentUser = {
//   id: string;
//   email: string;
//   role?: string;
// };

// @Injectable()
// export class BlogsService {
//   constructor(
//     @InjectRepository(Blog)
//     private readonly blogsRepository: Repository<Blog>,

//     @InjectRepository(Tag)
//     private readonly tagsRepository: Repository<Tag>,

//     @InjectRepository(User)
//     private readonly usersRepository: Repository<User>,
//   ) {}

//   // -----------------------------
//   // Helpers
//   // -----------------------------

//   private normalizePage(page?: number): number {
//     return page && page > 0 ? page : 1;
//   }

//   private normalizePageSize(pageSize?: number): number {
//     if (!pageSize || pageSize < 1) return 6;
//     return Math.min(pageSize, 50);
//   }

//   private normalizeTagName(tag: string): string {
//     return tag.trim().toLowerCase();
//   }

//   private normalizePageTitle(pageTitle: string): string {
//     return pageTitle.trim().toLowerCase();
//   }

//   private async ensureUniquePageTitle(pageTitle: string, ignoreBlogId?: string): Promise<void> {
//     const existing = await this.blogsRepository.findOne({
//       where: {
//         pageTitle: this.normalizePageTitle(pageTitle),
//       },
//     });

//     if (existing && existing.id !== ignoreBlogId) {
//       throw new BadRequestException('pageTitle already exists.');
//     }
//   }

//   private async resolveTags(tagNames?: string[]): Promise<Tag[]> {
//     if (!tagNames || tagNames.length === 0) return [];

//     const normalizedUniqueTags = [...new Set(
//       tagNames
//         .map((tag) => this.normalizeTagName(tag))
//         .filter(Boolean),
//     )];

//     if (normalizedUniqueTags.length === 0) return [];

//     const existingTags = await this.tagsRepository.find({
//       where: {
//         name: In(normalizedUniqueTags),
//       },
//     });

//     const existingMap = new Map(existingTags.map((tag) => [tag.name, tag]));
//     const newTags: Tag[] = [];

//     for (const tagName of normalizedUniqueTags) {
//       if (!existingMap.has(tagName)) {
//         const newTag = this.tagsRepository.create({ name: tagName });
//         newTags.push(newTag);
//       }
//     }

//     const savedNewTags =
//       newTags.length > 0 ? await this.tagsRepository.save(newTags) : [];

//     return [...existingTags, ...savedNewTags];
//   }

//   private async getAuthorOrFail(userId: string): Promise<User> {
//     const author = await this.usersRepository.findOne({
//       where: { id: userId },
//     });

//     if (!author) {
//       throw new NotFoundException('Author not found.');
//     }

//     return author;
//   }

//   private canManageBlog(blog: Blog, currentUser: CurrentUser): boolean {
//     if (blog.author?.id === currentUser.id) return true;
//     if (currentUser.role === 'admin') return true;
//     return false;
//   }

//   private applyPublishedAtOnCreate(status?: BlogStatus): Date | null {
//     return status === BlogStatus.PUBLISHED ? new Date() : null;
//   }

//   private applyPublishedAtOnUpdate(existing: Blog, nextStatus?: BlogStatus): Date | null {
//     const previousStatus = existing.status;
//     const targetStatus = nextStatus ?? previousStatus;

//     // draft -> published
//     if (
//       previousStatus === BlogStatus.DRAFT &&
//       targetStatus === BlogStatus.PUBLISHED
//     ) {
//       return new Date();
//     }

//     // published -> draft
//     if (
//       previousStatus === BlogStatus.PUBLISHED &&
//       targetStatus === BlogStatus.DRAFT
//     ) {
//       return null;
//     }

//     return existing.publishedAt;
//   }

//   private buildMeta(totalBlogs: number, currentPage: number, pageSize: number) {
//     return {
//       totalBlogs,
//       totalPages: Math.ceil(totalBlogs / pageSize),
//       currentPage,
//       pageSize,
//     };
//   }

//   // -----------------------------
//   // Public APIs
//   // -----------------------------

//   async getPublishedBlogs(queryDto: QueryBlogsDto) {
//     const page = this.normalizePage(queryDto.page);
//     const pageSize = this.normalizePageSize(queryDto.pageSize);
//     const skip = (page - 1) * pageSize;

//     const qb = this.blogsRepository
//       .createQueryBuilder('blog')
//       .leftJoinAndSelect('blog.author', 'author')
//       .leftJoinAndSelect('blog.tags', 'tag')
//       .where('blog.status = :status', { status: BlogStatus.PUBLISHED });

//     if (queryDto.query?.trim()) {
//       const q = `%${queryDto.query.trim().toLowerCase()}%`;

//       qb.andWhere(
//         `(
//           LOWER(blog.title) LIKE :q
//           OR LOWER(blog.excerpt) LIKE :q
//           OR LOWER(blog.content) LIKE :q
//           OR LOWER(author.name) LIKE :q
//         )`,
//         { q },
//       );
//     }

//     if (queryDto.tag?.trim()) {
//       const normalizedTag = this.normalizeTagName(queryDto.tag);
//       qb.andWhere('LOWER(tag.name) = :tag', { tag: normalizedTag });
//     }

//     qb.orderBy('blog.publishedAt', 'DESC')
//       .addOrderBy('blog.createdAt', 'DESC')
//       .skip(skip)
//       .take(pageSize);

//     const [blogs, totalBlogs] = await qb.getManyAndCount();

//     return {
//       blogs,
//       meta: this.buildMeta(totalBlogs, page, pageSize),
//     };
//   }

//   async getPublishedBlogByPageTitle(pageTitle: string): Promise<Blog> {
//     const blog = await this.blogsRepository
//       .createQueryBuilder('blog')
//       .leftJoinAndSelect('blog.author', 'author')
//       .leftJoinAndSelect('blog.tags', 'tag')
//       .where('blog.pageTitle = :pageTitle', {
//         pageTitle: this.normalizePageTitle(pageTitle),
//       })
//       .andWhere('blog.status = :status', {
//         status: BlogStatus.PUBLISHED,
//       })
//       .getOne();

//     if (!blog) {
//       throw new NotFoundException(`Published blog with pageTitle "${pageTitle}" not found.`);
//     }

//     return blog;
//   }

//   // -----------------------------
//   // Writer / Owner APIs
//   // -----------------------------

//   async getMyBlogs(currentUser: CurrentUser, queryDto: QueryBlogsDto) {
//     const page = this.normalizePage(queryDto.page);
//     const pageSize = this.normalizePageSize(queryDto.pageSize);
//     const skip = (page - 1) * pageSize;

//     const qb = this.blogsRepository
//       .createQueryBuilder('blog')
//       .leftJoinAndSelect('blog.author', 'author')
//       .leftJoinAndSelect('blog.tags', 'tag')
//       .where('author.id = :authorId', { authorId: currentUser.id });

//     if (queryDto.status) {
//       qb.andWhere('blog.status = :status', { status: queryDto.status });
//     }

//     if (queryDto.query?.trim()) {
//       const q = `%${queryDto.query.trim().toLowerCase()}%`;
//       qb.andWhere(
//         `(
//           LOWER(blog.title) LIKE :q
//           OR LOWER(blog.excerpt) LIKE :q
//           OR LOWER(blog.content) LIKE :q
//         )`,
//         { q },
//       );
//     }

//     if (queryDto.tag?.trim()) {
//       const normalizedTag = this.normalizeTagName(queryDto.tag);
//       qb.andWhere('LOWER(tag.name) = :tag', { tag: normalizedTag });
//     }

//     qb.orderBy('blog.updatedAt', 'DESC')
//       .skip(skip)
//       .take(pageSize);

//     const [blogs, totalBlogs] = await qb.getManyAndCount();

//     return {
//       blogs,
//       meta: this.buildMeta(totalBlogs, page, pageSize),
//     };
//   }

//   async getMyBlogById(blogId: string, currentUser: CurrentUser): Promise<Blog> {
//     const blog = await this.blogsRepository.findOne({
//       where: { id: blogId },
//       relations: {
//         author: true,
//         tags: true,
//       },
//     });

//     if (!blog) {
//       throw new NotFoundException(`Blog ${blogId} not found.`);
//     }

//     if (!this.canManageBlog(blog, currentUser)) {
//       throw new ForbiddenException('You are not allowed to access this blog.');
//     }

//     return blog;
//   }

//   async createBlog(dto: CreateBlogDto, currentUser: CurrentUser): Promise<Blog> {
//     await this.ensureUniquePageTitle(dto.pageTitle);

//     const author = await this.getAuthorOrFail(currentUser.id);
//     const tags = await this.resolveTags(dto.tags);

//     const normalizedStatus = dto.status ?? BlogStatus.DRAFT;

//     const blog = this.blogsRepository.create({
//       pageTitle: this.normalizePageTitle(dto.pageTitle),
//       title: dto.title.trim(),
//       excerpt: dto.excerpt.trim(),
//       coverImage: dto.coverImage.trim(),
//       content: dto.content.trim(),
//       status: normalizedStatus,
//       publishedAt: this.applyPublishedAtOnCreate(normalizedStatus),
//       author,
//       tags,
//     });

//     return this.blogsRepository.save(blog);
//   }

//   async updateBlog(
//     blogId: string,
//     dto: UpdateBlogDto,
//     currentUser: CurrentUser,
//   ): Promise<Blog> {
//     const blog = await this.blogsRepository.findOne({
//       where: { id: blogId },
//       relations: {
//         author: true,
//         tags: true,
//       },
//     });

//     if (!blog) {
//       throw new NotFoundException(`Blog ${blogId} not found.`);
//     }

//     if (!this.canManageBlog(blog, currentUser)) {
//       throw new ForbiddenException('You are not allowed to update this blog.');
//     }

//     if (dto.pageTitle !== undefined) {
//       const normalizedPageTitle = this.normalizePageTitle(dto.pageTitle);
//       await this.ensureUniquePageTitle(normalizedPageTitle, blog.id);
//       blog.pageTitle = normalizedPageTitle;
//     }

//     if (dto.title !== undefined) {
//       blog.title = dto.title.trim();
//     }

//     if (dto.excerpt !== undefined) {
//       blog.excerpt = dto.excerpt.trim();
//     }

//     if (dto.coverImage !== undefined) {
//       blog.coverImage = dto.coverImage.trim();
//     }

//     if (dto.content !== undefined) {
//       blog.content = dto.content.trim();
//     }

//     if (dto.status !== undefined) {
//       blog.publishedAt = this.applyPublishedAtOnUpdate(blog, dto.status);
//       blog.status = dto.status;
//     }

//     if (dto.tags !== undefined) {
//       blog.tags = await this.resolveTags(dto.tags);
//     }

//     return this.blogsRepository.save(blog);
//   }

//   async deleteBlog(blogId: string, currentUser: CurrentUser): Promise<{ deleted: true; id: string }> {
//     const blog = await this.blogsRepository.findOne({
//       where: { id: blogId },
//       relations: {
//         author: true,
//       },
//     });

//     if (!blog) {
//       throw new NotFoundException(`Blog ${blogId} not found.`);
//     }

//     if (!this.canManageBlog(blog, currentUser)) {
//       throw new ForbiddenException('You are not allowed to delete this blog.');
//     }

//     await this.blogsRepository.remove(blog);

//     return {
//       deleted: true,
//       id: blogId,
//     };
//   }

//   // -----------------------------
//   // Optional internal/admin-ready APIs
//   // -----------------------------

//   async getBlogById(blogId: string): Promise<Blog> {
//     const blog = await this.blogsRepository.findOne({
//       where: { id: blogId },
//       relations: {
//         author: true,
//         tags: true,
//       },
//     });

//     if (!blog) {
//       throw new NotFoundException(`Blog ${blogId} not found.`);
//     }

//     return blog;
//   }
// }
