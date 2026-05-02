import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtService } from '@nestjs/jwt';

import { ObservabilityForwarderService } from './observability-forwarder.service';

describe('ObservabilityForwarderService', () => {
  const originalEnv = { ...process.env };
  let service: ObservabilityForwarderService;
  let signSpy: ReturnType<typeof vi.fn>;

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

    signSpy = vi.fn(() => 'service-token');
    service = new ObservabilityForwarderService({
      sign: signSpy,
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

  it('keeps records queued when token cannot be built', async () => {
    signSpy.mockReturnValueOnce('');

    service.emit('metrics', {
      endpoint: '/blogs',
      method: 'GET',
      timestamp: new Date().toISOString(),
      latencyMs: 21,
      statusCode: 200,
    });

    await (service as any).flushAll();

    const stats = service.getStats();
    expect(stats.queueDepth).toBe(1);
    expect(stats.failed).toBe(1);
    expect(stats.flushed).toBe(0);
  });

  it('keeps records queued on non-2xx responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503 })) as any,
    );

    service.emit('events', {
      endpoint: '/auth/login',
      method: 'POST',
      timestamp: new Date().toISOString(),
      eventType: 'auth_login_success',
    });

    await (service as any).flushAll();

    const statsAfterFail = service.getStats();
    expect(statsAfterFail.queueDepth).toBe(1);
    expect(statsAfterFail.failed).toBe(1);
    expect(statsAfterFail.flushed).toBe(0);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200 })) as any,
    );
    await (service as any).flushAll();

    const statsAfterRetry = service.getStats();
    expect(statsAfterRetry.queueDepth).toBe(0);
    expect(statsAfterRetry.flushed).toBe(1);
  });
});
