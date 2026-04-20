import type { ApiResponse } from '../types/api';
import type { HikeRecord, RecordDraft, RecordFilters, RoutePlan } from '../types/models';
import { apiClient } from './apiClient';
import { authService } from './authService';

function getAuthHeader() {
  const token = authService.getToken();

  if (!token) {
    throw new Error('目前尚未登录，请重新登录后再试');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function normalizeEventPayload(draft: RecordDraft, routePlan: RoutePlan) {
  return {
    title: draft.title,
    description: draft.description,
    category: draft.category,
    completedDate: draft.completedDate,
    status: draft.status,
    notes: draft.notes,
    distanceKm: routePlan.distanceKm,
    durationMinutes: routePlan.durationMinutes,
    location: {
      name: routePlan.destination.label,
      description: '',
      address: routePlan.destination.address,
      latitude: routePlan.destination.lat,
      longitude: routePlan.destination.lng,
      category: 'destination',
      placeId: routePlan.destination.placeId,
    },
    routePlan,
  };
}

export const recordService = {
  async listRecords(filters?: RecordFilters): Promise<ApiResponse<HikeRecord[]>> {
    const query = new URLSearchParams();

    if (filters?.q) {
      query.set('q', filters.q);
    }

    if (filters?.category && filters.category !== 'all') {
      query.set('category', filters.category);
    }

    query.set('page', '1');
    query.set('limit', '100');

    const response = await apiClient.request<HikeRecord[]>(
      `/api/events${query.toString() ? `?${query}` : ''}`,
      {
        headers: getAuthHeader(),
      },
    );

    return response;
  },

  async getRecordById(id: string): Promise<ApiResponse<HikeRecord>> {
    return apiClient.request<HikeRecord>(`/api/events/${id}`, {
      headers: getAuthHeader(),
    });
  },

  async createRecord(draft: RecordDraft, routePlan: RoutePlan): Promise<ApiResponse<HikeRecord>> {
    return apiClient.request<HikeRecord>('/api/events', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(normalizeEventPayload(draft, routePlan)),
    });
  },

  async updateRecord(id: string, draft: RecordDraft): Promise<ApiResponse<HikeRecord>> {
    return apiClient.request<HikeRecord>(`/api/events/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(draft),
    });
  },
};
