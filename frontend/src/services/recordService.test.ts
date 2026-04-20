import { vi } from 'vitest';
import { recordService } from './recordService';
import { storageKeys } from './storage';

describe('recordService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(storageKeys.authToken, JSON.stringify('token-value'));
    vi.restoreAllMocks();
  });

  it('creates a new record through the backend API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: '徒步记录建立成功',
        data: {
          id: 'record-1',
          title: '测试路线',
          description: '用来验证 createRecord',
          category: 'forest',
          completedDate: '2026-04-10',
          status: 'completed',
          distanceKm: 4.3,
          durationMinutes: 90,
          notes: '树林浓度很高。',
          ownerId: 'user-real-lin',
          createdAt: '2026-04-10T10:00:00.000Z',
          updatedAt: '2026-04-10T10:00:00.000Z',
          location: {
            id: 'location-1',
            name: '终点',
            address: '终点地址',
            latitude: 25.08,
            longitude: 121.61,
            category: 'destination',
          },
          routePlan: {
            origin: {
              label: '起点',
              address: '起点地址',
              lat: 25.03,
              lng: 121.56,
            },
            destination: {
              label: '终点',
              address: '终点地址',
              lat: 25.08,
              lng: 121.61,
            },
            waypoints: [],
            distanceKm: 4.3,
            durationMinutes: 90,
          },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const response = await recordService.createRecord(
      {
        title: '测试路线',
        description: '用来验证 createRecord',
        category: 'forest',
        completedDate: '2026-04-10',
        status: 'completed',
        notes: '树林浓度很高。',
      },
      {
        origin: {
          label: '起点',
          address: '起点地址',
          lat: 25.03,
          lng: 121.56,
        },
        destination: {
          label: '终点',
          address: '终点地址',
          lat: 25.08,
          lng: 121.61,
        },
        waypoints: [],
        distanceKm: 4.3,
        durationMinutes: 90,
      },
    );

    expect(response.data.title).toBe('测试路线');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/events'),
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('updates an existing record through the backend API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: '徒步记录更新成功',
          data: {
            id: 'record-1',
            title: '更新后的路线标题',
            description: '沿着树林步行。',
            category: 'forest',
            completedDate: '2026-04-10',
            status: 'planned',
            distanceKm: 4.3,
            durationMinutes: 90,
            notes: '已经更新为真实 API 测试。',
            ownerId: 'user-real-lin',
            createdAt: '2026-04-10T10:00:00.000Z',
            updatedAt: '2026-04-10T12:00:00.000Z',
            location: {
              id: 'location-1',
              name: '终点',
              address: '终点地址',
              latitude: 25.08,
              longitude: 121.61,
              category: 'destination',
            },
            routePlan: {
              origin: {
                label: '起点',
                address: '起点地址',
                lat: 25.03,
                lng: 121.56,
              },
              destination: {
                label: '终点',
                address: '终点地址',
                lat: 25.08,
                lng: 121.61,
              },
              waypoints: [],
              distanceKm: 4.3,
              durationMinutes: 90,
            },
          },
        }),
      }),
    );

    const response = await recordService.updateRecord('record-1', {
      title: '更新后的路线标题',
      description: '沿着树林步行。',
      category: 'forest',
      completedDate: '2026-04-10',
      status: 'planned',
      notes: '已经更新为真实 API 测试。',
    });

    expect(response.data.status).toBe('planned');
    expect(response.data.title).toBe('更新后的路线标题');
  });
});
