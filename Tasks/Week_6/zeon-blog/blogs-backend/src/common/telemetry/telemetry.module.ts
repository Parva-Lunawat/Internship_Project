import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MetricsService } from './metrics.service';
import { ObservabilityForwarderService } from './observability-forwarder.service';
import { RequestTimingInterceptor } from './request-timing.interceptor';

@Global()
@Module({
  imports: [
    // Forwarder signs with an explicit per-call secret, so we avoid any hardcoded
    // module-level fallback secret.
    JwtModule.register({}),
  ],
  providers: [
    MetricsService,
    ObservabilityForwarderService,
    RequestTimingInterceptor,
  ],
  exports: [MetricsService, ObservabilityForwarderService, RequestTimingInterceptor],
})
export class TelemetryModule {}
