import { Module } from '@nestjs/common';

import { AuthModule } from '../../common/auth/auth.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';

@Module({
  imports: [TelemetryModule, AuthModule],
  controllers: [QueryController],
  providers: [QueryService],
  exports: [QueryService],
})
export class QueryModule {}
