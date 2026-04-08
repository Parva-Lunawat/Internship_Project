import { Module } from '@nestjs/common';
import { DiagnosticsController } from './diagnostics.controller';
import { TelemetryModule } from '../common/telemetry/telemetry.module';

@Module({
  imports: [TelemetryModule],
  controllers: [DiagnosticsController],
})
export class DiagnosticsModule {}
