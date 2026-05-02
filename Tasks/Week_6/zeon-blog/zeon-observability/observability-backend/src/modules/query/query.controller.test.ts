import { NotFoundException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';

import { HttpExceptionFilter } from '../../common/http-exception.filter';
import { QueryController } from './query.controller';

function routePath(methodName: keyof QueryController) {
  return Reflect.getMetadata(PATH_METADATA, QueryController.prototype[methodName]);
}

function routeMethod(methodName: keyof QueryController) {
  return Reflect.getMetadata(METHOD_METADATA, QueryController.prototype[methodName]);
}

function buildController() {
  const queryService = {
    dashboardSummary: vi.fn(async () => ({ cards: { totalRequests: 0 } })),
    requestBuckets: vi.fn(async () => []),
    bucketRequests: vi.fn(async () => []),
    bucketInsights: vi.fn(async () => ({ totalRequests: 0 })),
    knownRoutes: vi.fn(async () => []),
    issues: vi.fn(async () => ({ rows: [], total: 0, page: 1, limit: 20 })),
    issueDetail: vi.fn(async () => null),
  };
  return {
    controller: new QueryController(queryService as any),
    queryService,
  };
}

describe('QueryController route contracts', () => {
  it('keeps the known route catalog endpoint registered', () => {
    expect(routePath('knownRoutes')).toBe('endpoints');
    expect(routeMethod('knownRoutes')).toBe(0);
  });

  it('keeps dashboard summary registered at the stable contract path', () => {
    expect(routePath('dashboardSummary')).toBe('dashboard/summary');
    expect(routeMethod('dashboardSummary')).toBe(0);
  });

  it('keeps bucket list and drill-down endpoints registered', () => {
    expect(routePath('buckets')).toBe('buckets');
    expect(routePath('bucketRequests')).toBe('buckets/requests');
    expect(routePath('bucketInsights')).toBe('buckets/insights');
    expect(routeMethod('buckets')).toBe(0);
  });

  it('defaults dashboard summary duration to all time', async () => {
    const { controller, queryService } = buildController();

    await controller.dashboardSummary({ durationUnit: 'all', groupBy: 'hour' });

    expect(queryService.dashboardSummary).toHaveBeenCalledWith(expect.objectContaining({
      durationUnit: 'all',
      durationValue: 1,
    }));
  });

  it('passes valid relative duration and bucket grouping to bucket aggregation', async () => {
    const { controller, queryService } = buildController();

    await controller.buckets({ durationUnit: 'minutes', durationValue: '1', groupBy: 'hour' });

    expect(queryService.requestBuckets).toHaveBeenCalledWith(expect.objectContaining({
      durationUnit: 'minutes',
      durationValue: 1,
      groupBy: 'hour',
    }));
  });

  it('keeps issue grouping available through list and detail contracts', async () => {
    const { controller, queryService } = buildController();

    const list = await controller.issues({ page: '1', limit: '5' });
    await expect(controller.issueDetail('missing-fingerprint', {})).rejects.toBeInstanceOf(NotFoundException);

    expect(routePath('issues')).toBe('issues');
    expect(routePath('issueDetail')).toBe('issues/:fingerprint');
    expect(list.meta).toEqual({ total: 0, page: 1, limit: 20 });
    expect(queryService.issueDetail).toHaveBeenCalledWith('missing-fingerprint', expect.any(Object));
  });
});

describe('HttpExceptionFilter', () => {
  it('returns a generic message for framework 404 route misses', () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const filter = new HttpExceptionFilter();
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({
          originalUrl: '/api/v1/endpoints',
          method: 'GET',
          requestId: 'request-1',
        }),
      }),
    };

    filter.catch(new NotFoundException('Cannot GET /api/v1/endpoints'), host as any);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'The requested observability resource was not found.',
        requestId: 'request-1',
      }),
    });
  });
});
