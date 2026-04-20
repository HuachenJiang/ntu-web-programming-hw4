import type { ApiErrorResponse, ApiResponse } from '../types/api';

class ApiClientError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

function getBaseUrl() {
  const value = import.meta.env.VITE_API_BASE_URL?.trim();
  return value || 'http://localhost:3000';
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const raw = (await response.json().catch(() => null)) as ApiResponse<T> | ApiErrorResponse | null;

  if (!response.ok) {
    const message = raw?.message || `请求失败 (${response.status})`;
    throw new ApiClientError(response.status, message);
  }

  if (!raw || typeof raw !== 'object' || !('success' in raw)) {
    throw new ApiClientError(response.status, '后端响应格式不正确');
  }

  return raw as ApiResponse<T>;
}

export const apiClient = {
  async request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    return parseResponse<T>(response);
  },
};
