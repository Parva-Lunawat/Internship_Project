import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import type { AuthContext } from '../../common/auth/auth-context.type';
import { IngestionService } from '../ingestion/ingestion.service';

@Controller({ path: 'diagnostics', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiagnosticsController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Get('health')
  async health(@Req() req: { user: AuthContext }) {
    return {
      data: {
        status: 'ok',
        ts: new Date().toISOString(),
        tokenType: req.user.tokenType,
      },
    };
  }

  @Get('runtime')
  @Roles('admin')
  async runtime() {
    return {
      data: {
        ts: new Date().toISOString(),
        pid: process.pid,
        uptimeSec: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
    };
  }

  @Get('ingestion')
  @Roles('admin')
  async ingestion() {
    return {
      data: this.ingestionService.getStats(),
    };
  }
}
