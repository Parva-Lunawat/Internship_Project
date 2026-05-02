export type MeltRecord = {
  requestId?: string;
  traceId?: string;
  endpoint: string;
  method: string;
  statusCode?: number;
  latencyMs?: number;
  timestamp: string;
  userId?: string;
  eventType?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  sourceService?: string;
  serviceName?: string;
  schemaVersion?: string;
  message?: string;
  payload?: Record<string, unknown>;
};

export type MeltRecordType = 'metrics' | 'logs' | 'events' | 'traces';
