import { Controller, Get, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../modules/Auth/guard/jwt-auth.guard';
import type { CurrentUser } from '../modules/Auth/types/current-user.type';
import { MetricsService } from '../common/telemetry/metrics.service';

@ApiTags('Diagnostics')
@Controller({
  path: 'diagnostics',
  version: '1',
})
export class DiagnosticsController {
  constructor(private readonly metrics: MetricsService) {}

  private assertAdmin(user: CurrentUser) {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
  }

  @Get('runtime')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process runtime stats (admin)' })
  @ApiResponse({ status: 200, description: 'Runtime stats returned' })
  async runtime(@Req() req: { user: CurrentUser }) {
    this.assertAdmin(req.user);

    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    return {
      data: {
        ts: new Date().toISOString(),
        pid: process.pid,
        uptimeSec: process.uptime(),
        memory: mem,
        cpu,
      },
    };
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request metrics snapshot (admin)' })
  @ApiResponse({ status: 200, description: 'Metrics returned' })
  async metricsSnapshot(@Req() req: { user: CurrentUser }) {
    this.assertAdmin(req.user);
    return {
      data: this.metrics.snapshot(),
    };
  }
}

