import { SetMetadata } from '@nestjs/common';

import type { AuthRole } from './auth-context.type';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AuthRole[]) => SetMetadata(ROLES_KEY, roles);
