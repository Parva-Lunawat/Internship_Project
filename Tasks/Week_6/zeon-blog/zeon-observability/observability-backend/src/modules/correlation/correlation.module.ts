import { Module } from '@nestjs/common';

import { AuthModule } from '../../common/auth/auth.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { CorrelationController } from './correlation.controller';
import { CorrelationService } from './correlation.service';

@Module({
  imports: [TelemetryModule, AuthModule],
  controllers: [CorrelationController],
  providers: [CorrelationService],
})
export class CorrelationModule {}
