import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtService } from '@nestjs/jwt';

import { ObservabilityForwarderService } from './observability-forwarder.service';

describe('ObservabilityForwarderService', () => {
  const originalEnv = { ...process.env };
  let service: ObservabilityForwarderService;

  beforeEach(() => {
    process.env.OBS_FORWARD_ENABLED = '1';
    process.env.OBS_BASE_URL = 'http://localhost:5100/api/v1';
    process.env.OBS_INGEST_JWT_SECRET = 'test-secret';
    process.env.OBS_BATCH_SIZE = '10';
    process.env.OBS_FLUSH_MS = '1000';
    process.env.OBS_QUEUE_MAX = '20';

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200 })) as any,
    );

    service = new ObservabilityForwarderService({
      sign: vi.fn(() => 'service-token'),
    } as unknown as JwtService);
  });

  afterEach(() => {
    service.onModuleDestroy();
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it('accepts records into queue without throwing', () => {
    service.emit('events', {
      endpoint: '/auth/login',
      method: 'POST',
      timestamp: new Date().toISOString(),
      eventType: 'auth_login_success',
    });
    const stats = service.getStats();
    expect(stats.accepted).toBe(1);
    expect(stats.queueDepth).toBe(1);
    expect(stats.dropped).toBe(0);
  });
});
