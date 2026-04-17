import { demoRecords } from './mockData';
import { recordService } from './recordService';
import { storageKeys, writeStorage } from './storage';

describe('recordService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    writeStorage(storageKeys.records, demoRecords);
  });

  it('creates a new record and stores it locally', async () => {
    const response = await recordService.createRecord(
      {
        title: '测试路线',
        description: '用来验证 createRecord',
        category: 'forest',
        completedDate: '2026-04-10',
        status: 'completed',
        notes: '树林浓度很高，适合做 smoke test。',
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
      {
        id: 'user-demo-lin',
        name: '林向野',
        email: 'demo@hikelog.test',
      },
    );

    const list = await recordService.listRecords('user-demo-lin');

    expect(response.data.title).toBe('测试路线');
    expect(list.data[0].title).toBe('测试路线');
  });

  it('updates an existing record', async () => {
    const response = await recordService.updateRecord(demoRecords[0].id, {
      title: '更新后的路线标题',
      description: demoRecords[0].description,
      category: demoRecords[0].category,
      completedDate: demoRecords[0].completedDate,
      status: 'planned',
      notes: '已经更新这条 mock 记录。',
    });

    expect(response.data.title).toBe('更新后的路线标题');
    expect(response.data.status).toBe('planned');
  });
});
