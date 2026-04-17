export type HikeCategory = 'ridge' | 'forest' | 'coast' | 'urban';
export type RecordStatus = 'planned' | 'completed' | 'canceled';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  placeId?: string;
}

export interface RoutePoint {
  label: string;
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface RoutePlan {
  origin: RoutePoint;
  destination: RoutePoint;
  waypoints: RoutePoint[];
  distanceKm: number;
  durationMinutes: number;
  overviewPolyline?: string;
}

export interface HikeRecord {
  id: string;
  title: string;
  description: string;
  category: HikeCategory;
  completedDate: string;
  status: RecordStatus;
  distanceKm: number;
  durationMinutes: number;
  location: Location;
  routePlan: RoutePlan;
  notes: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordFilters {
  q: string;
  category: HikeCategory | 'all';
}

export interface RouteRequest {
  origin: string;
  destination: string;
}

export interface SearchLocationResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface RecordDraft {
  title: string;
  description: string;
  category: HikeCategory;
  completedDate: string;
  status: RecordStatus;
  notes: string;
}
