import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagnosticsController } from './diagnostics.controller';

describe('DiagnosticsController (vitest)', () => {
  let controller: DiagnosticsController;
  const metricsService = {
    snapshot: vi.fn(),
  };
  const forwarderService = {
    getStats: vi.fn(),
  };

  beforeEach(() => {
    metricsService.snapshot.mockReset();
    forwarderService.getStats.mockReset();
    controller = new DiagnosticsController(
      metricsService as any,
      forwarderService as any,
    );
  });

  it('returns runtime snapshot for admin user', async () => {
    const response = await controller.runtime({
      user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' },
    });

    expect(response.data.pid).toBeTypeOf('number');
    expect(response.data.uptimeSec).toBeTypeOf('number');
    expect(response.data.memory).toBeDefined();
    expect(response.data.cpu).toBeDefined();
  });

  it('rejects runtime snapshot for non-admin user', async () => {
    await expect(
      controller.runtime({
        user: { id: 'writer-1', email: 'writer@example.com', role: 'writer' },
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns metrics snapshot for admin user', async () => {
    metricsService.snapshot.mockReturnValueOnce({
      ts: '2026-04-24T00:00:00.000Z',
      recent: [],
      aggregates: {},
    });
    forwarderService.getStats.mockReturnValueOnce({
      enabled: true,
      queueDepth: 0,
      accepted: 10,
      dropped: 0,
      flushed: 10,
      failed: 0,
    });

    const response = await controller.metricsSnapshot({
      user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' },
    });

    expect(metricsService.snapshot).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
      data: {
        metrics: {
          ts: '2026-04-24T00:00:00.000Z',
          recent: [],
          aggregates: {},
        },
        forwarding: {
          enabled: true,
          queueDepth: 0,
          accepted: 10,
          dropped: 0,
          flushed: 10,
          failed: 0,
        },
      },
    });
  });
});
