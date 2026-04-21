import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';
import type { ApiErrorResponse, ApiResponse } from '../types/api';
import { readStorage, storageKeys } from './storage';

class ApiClientError extends Error {
  status: number;
  errors?: ApiErrorResponse['errors'];

  constructor(status: number, message: string, errors?: ApiErrorResponse['errors']) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
  }
}

function getBaseUrl() {
  const value = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!value) {
    throw new Error('VITE_API_BASE_URL 未配置，无法发送 API 请求。');
  }

  return value;
}

function buildErrorMessage(status: number, raw?: ApiErrorResponse) {
  if (raw?.errors?.length) {
    return raw.errors
      .map((error) => (error.field ? `${error.field}: ${error.message}` : error.message))
      .join('；');
  }

  return raw?.message || `请求失败 (${status})`;
}

function normalizeAxiosError(error: AxiosError<ApiErrorResponse>) {
  const status = error.response?.status ?? 0;
  const raw = error.response?.data;

  if (!error.response) {
    return new ApiClientError(status, '无法连接后端，请确认前后端服务都已启动。');
  }

  return new ApiClientError(status, buildErrorMessage(status, raw), raw?.errors);
}

function parseResponse<T>(raw: unknown): ApiResponse<T> {
  if (!raw || typeof raw !== 'object' || !('success' in raw)) {
    throw new ApiClientError(500, '后端响应格式不正确');
  }

  return raw as ApiResponse<T>;
}

let client: AxiosInstance | null = null;

function getClient() {
  if (client) {
    return client;
  }

  client = axios.create({
    baseURL: getBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const token = readStorage<string | null>(storageKeys.authToken, null);

    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => Promise.reject(normalizeAxiosError(error)),
  );

  return client;
}

export const apiClient = {
  async request<T>(path: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await getClient().request<ApiResponse<T>>({
      url: path,
      ...config,
    });

    return parseResponse<T>(response.data);
  },
};
