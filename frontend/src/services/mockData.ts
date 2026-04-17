import type { HikeRecord, User } from '../types/models';

interface MockStoredUser extends User {
  password: string;
}

export const demoUsers: MockStoredUser[] = [
  {
    id: 'user-demo-lin',
    name: '林向野',
    email: 'demo@hikelog.test',
    password: 'trail123',
  },
];

export const demoRecords: HikeRecord[] = [
  {
    id: 'record-elephant-hill',
    title: '晨雾里的象山到虎山穿越',
    description: '趁着周六清晨走一段近郊山径，测试路线与记录流程。',
    category: 'ridge',
    completedDate: '2026-04-06',
    status: 'completed',
    distanceKm: 5.8,
    durationMinutes: 112,
    ownerId: 'user-demo-lin',
    notes:
      '前段阶梯密集，到了鞍部以后风景一下打开。建议早一点出发，城市边缘会有很漂亮的逆光。',
    createdAt: '2026-04-06T07:30:00.000Z',
    updatedAt: '2026-04-06T07:30:00.000Z',
    location: {
      id: 'location-hushan',
      name: '虎山亲山步道',
      address: '台北市信义区福德街 251 巷',
      latitude: 25.0318,
      longitude: 121.5849,
      category: 'trailhead',
      placeId: 'ChIJv8eN5m2rQjQR9X47DkVwS0k',
    },
    routePlan: {
      origin: {
        label: '象山步道入口',
        address: '台北市信义区信义路五段 150 巷',
        lat: 25.0273,
        lng: 121.5709,
      },
      destination: {
        label: '虎山亲山步道',
        address: '台北市信义区福德街 251 巷',
        lat: 25.0318,
        lng: 121.5849,
      },
      waypoints: [],
      distanceKm: 5.8,
      durationMinutes: 112,
      overviewPolyline: '',
    },
  },
  {
    id: 'record-bitou',
    title: '鼻头角海岸光线采集',
    description: '海风很强，适合做一条轻装步道路线的范例。',
    category: 'coast',
    completedDate: '2026-04-02',
    status: 'planned',
    distanceKm: 3.6,
    durationMinutes: 76,
    ownerId: 'user-demo-lin',
    notes:
      '这条路线的重点不是速度，而是视野变化。若天气稳定，可以顺手补一组海岸地形照片。',
    createdAt: '2026-04-02T10:00:00.000Z',
    updatedAt: '2026-04-02T10:00:00.000Z',
    location: {
      id: 'location-bitou',
      name: '鼻头角步道',
      address: '新北市瑞芳区鼻头路',
      latitude: 25.1292,
      longitude: 121.9221,
      category: 'viewpoint',
      placeId: 'ChIJd8N4b4tQQjQR1YVJr2R6k2k',
    },
    routePlan: {
      origin: {
        label: '鼻头服务区',
        address: '新北市瑞芳区鼻头路',
        lat: 25.129,
        lng: 121.9188,
      },
      destination: {
        label: '鼻头角灯塔',
        address: '新北市瑞芳区鼻头角步道',
        lat: 25.1308,
        lng: 121.9223,
      },
      waypoints: [],
      distanceKm: 3.6,
      durationMinutes: 76,
      overviewPolyline: '',
    },
  },
];

export type { MockStoredUser };
