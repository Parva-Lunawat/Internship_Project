import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { MetricsBatchDto } from './ingest-batches.dto';

describe('MetricsBatchDto validation', () => {
  it('rejects invalid status code', async () => {
    const dto = plainToInstance(MetricsBatchDto, {
      items: [
        {
          endpoint: '/blogs',
          method: 'GET',
          statusCode: 40,
          latencyMs: 12,
          timestamp: new Date().toISOString(),
          serviceName: 'blogs-backend',
          schemaVersion: '1.0',
        },
      ],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
