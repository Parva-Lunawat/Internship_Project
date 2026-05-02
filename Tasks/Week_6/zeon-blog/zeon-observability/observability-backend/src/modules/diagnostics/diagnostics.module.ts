import { Module } from '@nestjs/common';

import { AuthModule } from '../../common/auth/auth.module';
import { IngestionModule } from '../ingestion/ingestion.module';
import { DiagnosticsController } from './diagnostics.controller';

@Module({
  imports: [AuthModule, IngestionModule],
  controllers: [DiagnosticsController],
})
export class DiagnosticsModule {}
