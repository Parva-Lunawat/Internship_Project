import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 20;
}

export class TimeRangeDto extends PaginationDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}

export class MetricsAggregateQueryDto extends TimeRangeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  endpoint?: string;

  @IsOptional()
  @IsString()
  @IsIn(['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'])
  method?: string;

  @IsOptional()
  @IsString()
  @IsIn(['minute', 'hour', 'day'])
  groupBy?: 'minute' | 'hour' | 'day' = 'hour';
}

export class LogsQueryDto extends TimeRangeDto {
  @IsOptional()
  @IsString()
  @IsIn(['debug', 'info', 'warn', 'error'])
  level?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  endpoint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  requestId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  traceId?: string;
}

export class EventsQueryDto extends TimeRangeDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  eventType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  userId?: string;
}

export class TracesQueryDto extends TimeRangeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  endpoint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  requestId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  traceId?: string;
}
