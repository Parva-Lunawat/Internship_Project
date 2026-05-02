import { describe, expect, it, vi } from 'vitest';

import { IngestionService } from './ingestion.service';

function buildService() {
  return new IngestionService(
    { insert: vi.fn(async () => undefined) } as any,
    { insert: vi.fn(async () => undefined) } as any,
    { insert: vi.fn(async () => undefined) } as any,
    { insert: vi.fn(async () => undefined) } as any,
  );
}

describe('IngestionService', () => {
  it('queues telemetry in a bounded non-throwing way', () => {
    const service = buildService();
    const response = service.enqueueMetrics([
      {
        endpoint: '/blogs',
        method: 'GET',
        statusCode: 200,
        latencyMs: 12,
        timestamp: new Date().toISOString(),
        serviceName: 'blogs-backend',
        schemaVersion: '1.0',
      },
    ]);

    expect(response.accepted).toBe(1);
    expect(response.rejected).toBe(0);
    expect(service.getStats().queueDepth).toBeGreaterThan(0);
  });
});
