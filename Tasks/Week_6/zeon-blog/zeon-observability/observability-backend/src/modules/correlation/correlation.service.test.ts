import { describe, expect, it, vi } from 'vitest';

import { CorrelationService } from './correlation.service';

describe('CorrelationService', () => {
  it('returns grouped correlation summary by request id', async () => {
    const service = new CorrelationService(
      { find: vi.fn(async () => [{ id: 1 }]) } as any,
      { find: vi.fn(async () => [{ id: 2 }, { id: 3 }]) } as any,
      { find: vi.fn(async () => []) } as any,
      { find: vi.fn(async () => [{ id: 4 }]) } as any,
    );

    const result = await service.byRequestId('req-1');
    expect(result.summary.requestId).toBe('req-1');
    expect(result.summary.logs).toBe(2);
    expect(result.summary.metrics).toBe(1);
    expect(result.summary.traces).toBe(1);
  });
});
