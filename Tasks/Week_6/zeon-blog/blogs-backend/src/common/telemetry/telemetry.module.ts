import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MetricsService } from './metrics.service';
import { ObservabilityForwarderService } from './observability-forwarder.service';
import { RequestTimingInterceptor } from './request-timing.interceptor';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.OBS_INGEST_JWT_SECRET || 'placeholder-observability',
    }),
  ],
  providers: [
    MetricsService,
    ObservabilityForwarderService,
    RequestTimingInterceptor,
  ],
  exports: [MetricsService, ObservabilityForwarderService, RequestTimingInterceptor],
})
export class TelemetryModule {}
