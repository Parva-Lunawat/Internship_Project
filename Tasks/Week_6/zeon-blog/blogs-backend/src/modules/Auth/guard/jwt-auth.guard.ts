// JwtAuthGuard runs
// It triggers strategy 'jwt'
// jwt.strategy.ts extracts token from Authorization header
// verifies signature using JWT_SECRET
// checks expiration
// decodes payload
// runs validate(payload)
// returned object becomes req.user
// controller executes

import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

// to protect routes with this method
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.cookies['access_token'];
        if (!token) {
            throw new UnauthorizedException('No token found');
        }
        return super.canActivate(context);
    }
}