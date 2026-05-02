import { Transform } from 'class-transformer';
import {
  IsISO8601,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const SAFE_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;

export class TelemetryBaseDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  @Matches(SAFE_ID_PATTERN)
  requestId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  @Matches(SAFE_ID_PATTERN)
  traceId?: string;

  @IsString()
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  endpoint!: string;

  @IsString()
  @IsIn(['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'])
  method!: string;

  @IsOptional()
  @IsNumber()
  @Min(100)
  statusCode?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  latencyMs?: number;

  @IsISO8601()
  timestamp!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  userId?: string;

  @IsString()
  @MaxLength(80)
  serviceName!: string;

  @IsString()
  @MaxLength(20)
  schemaVersion!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

export class MetricIngestDto extends TelemetryBaseDto {
  @IsNumber()
  @Min(100)
  statusCode!: number;

  @IsNumber()
  @Min(0)
  latencyMs!: number;
}

export class LogIngestDto extends TelemetryBaseDto {
  @IsString()
  @IsIn(['debug', 'info', 'warn', 'error'])
  logLevel!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

export class EventIngestDto extends TelemetryBaseDto {
  @IsString()
  @MaxLength(120)
  eventType!: string;
}

export class TraceIngestDto extends TelemetryBaseDto {
  @IsString()
  @MaxLength(128)
  @Matches(SAFE_ID_PATTERN)
  traceId!: string;
}
