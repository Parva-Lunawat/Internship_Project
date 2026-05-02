import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventEntity } from './entities/event.entity';
import { LogEntity } from './entities/log.entity';
import { MetricEntity } from './entities/metric.entity';
import { TraceEntity } from './entities/trace.entity';
import { TelemetrySchemaService } from './telemetry-schema.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetricEntity, LogEntity, EventEntity, TraceEntity]),
  ],
  providers: [TelemetrySchemaService],
  exports: [TypeOrmModule],
})
export class TelemetryModule {}
