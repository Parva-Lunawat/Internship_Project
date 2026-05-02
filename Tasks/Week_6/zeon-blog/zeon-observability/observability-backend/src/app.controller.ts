import { Controller, Get } from '@nestjs/common';

@Controller({ path: '', version: '1' })
export class AppController {
  @Get()
  index() {
    return {
      data: {
        service: 'zeon-observability-backend',
        status: 'ok',
        ts: new Date().toISOString(),
        endpoints: [
          '/api/v1/ingest/metrics',
          '/api/v1/ingest/logs',
          '/api/v1/ingest/events',
          '/api/v1/ingest/traces',
          '/api/v1/metrics/aggregate',
          '/api/v1/logs',
          '/api/v1/events',
          '/api/v1/traces',
          '/api/v1/correlation/request/:requestId',
          '/api/v1/correlation/trace/:traceId',
          '/api/v1/diagnostics/health',
        ],
      },
    };
  }
}
