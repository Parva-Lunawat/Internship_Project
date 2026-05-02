import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { CorrelationService } from './correlation.service';

@Controller({ path: 'correlation', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CorrelationController {
  constructor(private readonly correlationService: CorrelationService) {}

  @Get('request/:requestId')
  async byRequestId(@Param('requestId') requestId: string) {
    return {
      data: await this.correlationService.byRequestId(requestId),
    };
  }

  @Get('trace/:traceId')
  async byTraceId(@Param('traceId') traceId: string) {
    return {
      data: await this.correlationService.byTraceId(traceId),
    };
  }
}
