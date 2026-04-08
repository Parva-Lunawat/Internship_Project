// // strategy
// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import type { CurrentUser } from '../types/current-user.type';

// type JwtPayload = {
//     sub: string;
//     email: string;
//     role: string;
// };

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//     constructor(configService: ConfigService) {
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             ignoreExpiration: false,
//             secretOrKey: configService.get<string>('JWT_SECRET') || 'dev-secret',
//         });
//     }

//     async validate(payload: JwtPayload): Promise<CurrentUser> {
//         return {
//             id: payload.sub,
//             email: payload.email,
//             role: payload.role,
//         };
//     }
// }

// // service

// import {
//     BadRequestException,
//     Injectable,
//     UnauthorizedException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { JwtService } from '@nestjs/jwt';
// import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';

// import { User } from '../../users/entities/user.entity';
// import { SignupDto } from './dto/signup.dto';
// import { LoginDto } from './dto/login.dto';

// @Injectable()
// export class AuthService {
//     constructor(
//         @InjectRepository(User)
//         private readonly usersRepository: Repository<User>,
//         private readonly jwtService: JwtService,
//     ) { }

//     private buildAuthResponse(user: User) {
//         const payload = {
//             sub: user.id,
//             email: user.email,
//             role: user.role,
//         };

//         const accessToken = this.jwtService.sign(payload);

//         return {
//             accessToken,
//             user: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//         };
//     }

//     async signup(dto: SignupDto) {
//         const email = dto.email.trim().toLowerCase();
//         const name = dto.name.trim();

//         if (dto.password !== dto.confirmPass) {
//             throw new BadRequestException(
//                 'Password must match with confirmed password.',
//             );
//         }

//         const existingUser = await this.usersRepository.findOne({
//             where: { email },
//         });

//         if (existingUser) {
//             throw new BadRequestException('Email already exists.');
//         }

//         const passwordHash = await bcrypt.hash(dto.password, 10);

//         const user = this.usersRepository.create({
//             name,
//             email,
//             passwordHash,
//             role: 'writer',
//         });

//         const savedUser = await this.usersRepository.save(user);

//         return this.buildAuthResponse(savedUser);
//     }

//     async login(dto: LoginDto) {
//         const email = dto.email.trim().toLowerCase();

//         const user = await this.usersRepository.findOne({
//             where: { email },
//         });

//         if (!user) {
//             throw new UnauthorizedException('Invalid email or password.');
//         }

//         const passwordMatched = await bcrypt.compare(
//             dto.password,
//             user.passwordHash,
//         );

//         if (!passwordMatched) {
//             throw new UnauthorizedException('Invalid email or password.');
//         }

//         return this.buildAuthResponse(user);
//     }

//     async me(currentUser: { id: string }) {
//         const user = await this.usersRepository.findOne({
//             where: { id: currentUser.id },
//         });

//         if (!user) {
//             throw new UnauthorizedException('User not found.');
//         }

//         return {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//         };
//     }
// }

// // controller

// import {
//     Body,
//     Controller,
//     Get,
//     Post,
//     Req,
//     UseGuards,
// } from '@nestjs/common';
// import {
//     ApiBearerAuth,
//     ApiBody,
//     ApiOperation,
//     ApiResponse,
//     ApiTags,
// } from '@nestjs/swagger';

// import { AuthService } from './auth.service';
// import { SignupDto } from './dto/signup.dto';
// import { LoginDto } from './dto/login.dto';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';
// import type { CurrentUser } from './types/current-user.type';

// @ApiTags('Auth')
// @Controller({
//     path: 'auth',
//     version: '1',
// })
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
//             data: await this.authService.signup(dto),
//         };
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
//             data: await this.authService.login(dto),
//         };
//     }

//     @Get('me')
//     @UseGuards(JwtAuthGuard)
//     @ApiBearerAuth()
//     @ApiOperation({
//         summary: 'Get current authenticated user',
//         description: 'Returns the currently logged-in user from JWT',
//     })
//     @ApiResponse({ status: 200, description: 'Current user returned successfully' })
//     @ApiResponse({ status: 401, description: 'Unauthorized' })
//     async me(@Req() req: { user: CurrentUser }) {
//         return {
//             data: await this.authService.me(req.user),
//         };
//     }
// }

// // module

// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { JwtStrategy } from './strategies/jwt.strategy';
// import { User } from '../../users/entities/user.entity';

// @Module({
//     imports: [
//         ConfigModule,
//         TypeOrmModule.forFeature([User]),
//         JwtModule.registerAsync({
//             imports: [ConfigModule],
//             inject: [ConfigService],
//             useFactory: (configService: ConfigService) => ({
//                 secret: configService.get<string>('JWT_SECRET') || 'dev-secret',
//                 signOptions: {
//                     expiresIn: '7d',
//                 },
//             }),
//         }),
//     ],
//     controllers: [AuthController],
//     providers: [AuthService, JwtStrategy],
//     exports: [AuthService],
// })
// export class AuthModule { }

