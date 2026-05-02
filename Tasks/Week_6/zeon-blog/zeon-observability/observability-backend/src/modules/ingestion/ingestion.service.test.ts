import { describe, expect, it, vi } from 'vitest';

import { IngestionService } from './ingestion.service';

function repo() {
  return { save: vi.fn(async () => undefined) };
}

describe('IngestionService compatibility mapping', () => {
  it('stores sourceService when only the legacy serviceName alias is sent', async () => {
    const metricsRepo = repo();
    const service = new IngestionService(metricsRepo as any, repo() as any, repo() as any, repo() as any);

    service.enqueueMetrics([{
      endpoint: '/blogs',
      method: 'GET',
      statusCode: 200,
      latencyMs: 42,
      timestamp: '2026-01-01T00:00:00.000Z',
      serviceName: 'blogs-backend',
    } as any]);
    await (service as any).flush();

    expect(metricsRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({
        sourceService: 'blogs-backend',
        serviceName: 'blogs-backend',
        schemaVersion: '1.0',
      }),
    ]);
  });
});
