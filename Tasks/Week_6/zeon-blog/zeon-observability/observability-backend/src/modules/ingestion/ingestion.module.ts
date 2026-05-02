import { Module } from '@nestjs/common';

import { AuthModule } from '../../common/auth/auth.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';

@Module({
  imports: [TelemetryModule, AuthModule],
  controllers: [IngestionController],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
