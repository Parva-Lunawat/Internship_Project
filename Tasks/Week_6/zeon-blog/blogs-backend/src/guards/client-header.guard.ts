import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ClientHeaderGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        const clientId = request.headers['x-client-id'];
        const requestSource = request.headers['x-request-source'];

        if (!clientId || typeof clientId !== 'string') {
            throw new UnauthorizedException('Missing x-client-id header');
        }

        if (!requestSource || typeof requestSource !== 'string') {
            throw new UnauthorizedException('Missing x-request-source header');
        }

        const allowedClientIds = ['web-app', 'swagger', 'mobile-app'];
        const allowedSources = ['web', 'swagger', 'mobile'];

        if (!allowedClientIds.includes(clientId)) {
            throw new UnauthorizedException('Invalid x-client-id');
        }

        if (!allowedSources.includes(requestSource)) {
            throw new UnauthorizedException('Invalid x-request-source');
        }

        request.clientMeta = {
            clientId,
            requestSource,
        };

        return true;
    }
}