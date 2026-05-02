import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';

import {
  EventIngestDto,
  LogIngestDto,
  MetricIngestDto,
  TraceIngestDto,
} from './shared.dto';

export class MetricsBatchDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => MetricIngestDto)
  items!: MetricIngestDto[];
}

export class LogsBatchDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => LogIngestDto)
  items!: LogIngestDto[];
}

export class EventsBatchDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => EventIngestDto)
  items!: EventIngestDto[];
}

export class TracesBatchDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => TraceIngestDto)
  items!: TraceIngestDto[];
}
