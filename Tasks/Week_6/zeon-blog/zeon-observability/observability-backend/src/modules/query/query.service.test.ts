import { describe, expect, it, vi } from 'vitest';

import { QueryService } from './query.service';

function buildMetricRepo(rows: any[]) {
  return {
    createQueryBuilder: vi.fn(() => {
      let offset = 0;
      let limit = rows.length;
      let qb: any;
      qb = {
        andWhere: vi.fn(() => qb),
        orderBy: vi.fn(() => qb),
        addOrderBy: vi.fn(() => qb),
        skip: vi.fn((value: number) => {
          offset = value;
          return qb;
        }),
        take: vi.fn((value: number) => {
          limit = value;
          return qb;
        }),
        getMany: vi.fn(async () => rows.slice(offset, offset + limit)),
      };
      return qb;
    }),
  };
}

describe('QueryService metric aggregation', () => {
  it('does not silently cap bucket aggregation at the first metric page', async () => {
    const rows = Array.from({ length: 10_001 }, (_, index) => ({
      id: index + 1,
      timestamp: new Date('2026-01-01T00:00:00.000Z'),
      endpoint: '/blogs',
      method: 'GET',
      statusCode: 200,
      latencyMs: 25,
      requestId: `request-${index + 1}`,
      traceId: null,
      userId: null,
      sourceService: 'blogs-backend',
      serviceName: null,
      payload: null,
    }));
    const metricRepo = buildMetricRepo(rows);
    const service = new QueryService(
      metricRepo as any,
      {} as any,
      {} as any,
      {} as any,
    );

    const buckets = await service.requestBuckets({ groupBy: 'hour' });

    expect(buckets).toHaveLength(1);
    expect(buckets[0].requestCount).toBe(10_001);
    expect(metricRepo.createQueryBuilder).toHaveBeenCalledTimes(2);
  });
});
