import { Controller, Get, Post, Body, Req, UseGuards, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import type { CurrentUser } from '../types/current-user.type';
import { ClientHeaderGuard } from 'src/guards/client-header.guard';

@ApiTags('Auth')
@Controller({
    path: 'auth',
    version: '1'
})
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Creates a new user account and returns an access token',
    })
    @ApiBody({ type: SignupDto })
    @ApiResponse({ status: 201, description: 'Signup successful' })
    @ApiResponse({ status: 400, description: 'Invalid signup data' })
    async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.signup(dto);
        res.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: false, // true in production with https
            sameSite: 'lax',
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });
        return {
            data: result
        }
    }

    @Post('login')
    @ApiOperation({
        summary: 'Login user',
        description: 'Authenticates a user and returns an access token',
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(dto);
        res.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: false, // true in production with https
            sameSite: 'lax',
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });
        return {
            data: result
        }
    }

    @Get('self')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get current authenticated user',
        description: 'Returns the currently logged-in user from JWT',
    })
    @ApiResponse({ status: 200, description: 'Current user returned successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async self(@Req() req: { user: CurrentUser }) {
        return {
            data: await this.authService.self(req.user)
        }
    }

    @Post('logout')
    @ApiOperation({
        summary: 'Logout user',
        description: 'Clears authentication cookie and logs out user',
    })
    @ApiResponse({ status: 200, description: 'Logged out successfully' })
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: false, // true in production
            sameSite: 'lax',
        });

        return {
            message: 'Logged out successfully',
        };
    }
}

