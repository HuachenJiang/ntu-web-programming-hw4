import type { HikeCategory, RecordStatus } from '../types/models';

export const categoryOptions: Array<{ value: HikeCategory; label: string }> = [
  { value: 'ridge', label: '山脊线路' },
  { value: 'forest', label: '森林步道' },
  { value: 'coast', label: '海岸散策' },
  { value: 'urban', label: '城市漫游' },
];

export const statusOptions: Array<{ value: RecordStatus; label: string }> = [
  { value: 'planned', label: '规划中' },
  { value: 'completed', label: '已完成' },
  { value: 'canceled', label: '已取消' },
];

export const appPaths = {
  home: '/',
  login: '/login',
  register: '/register',
  map: '/map',
  records: '/records',
};

export const demoRouteRequest = {
  origin: '台北市象山步道',
  destination: '台北市虎山亲山步道',
};
