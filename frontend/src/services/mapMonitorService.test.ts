import { beforeEach, describe, expect, it } from 'vitest';
import { mapMonitorService } from './mapMonitorService';

describe('mapMonitorService', () => {
  beforeEach(() => {
    mapMonitorService.clear();
  });

  it('aggregates request counts and rates', () => {
    mapMonitorService.setUserContext('user-1');
    mapMonitorService.record({
      service: 'maps-js',
      status: 'success',
      latencyMs: 120,
    });
    mapMonitorService.record({
      service: 'directions',
      status: 'error',
      latencyMs: 240,
      errorCode: 'REQUEST_DENIED',
    });

    const summary = mapMonitorService.getSummary();

    expect(summary.totalCount).toBe(2);
    expect(summary.successCount).toBe(1);
    expect(summary.errorCount).toBe(1);
    expect(summary.successRate).toBe(50);
    expect(summary.errorRate).toBe(50);
    expect(summary.averageLatencyMs).toBe(180);
    expect(summary.latestEvent?.userId).toBe('user-1');
  });

  it('marks quota risk when the service count reaches the threshold', () => {
    for (let index = 0; index < 40; index += 1) {
      mapMonitorService.record({
        service: 'directions',
        status: 'success',
        latencyMs: 80,
      });
    }

    const summary = mapMonitorService.getSummary();
    const directionsSummary = summary.services.find((service) => service.service === 'directions');

    expect(summary.quotaRisk).toBe(true);
    expect(directionsSummary?.quotaRisk).toBe(true);
    expect(summary.latestEvent?.quotaRisk).toBe(true);
  });
});
