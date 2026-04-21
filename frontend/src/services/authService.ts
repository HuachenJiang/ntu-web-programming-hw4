import type { ApiResponse } from '../types/api';
import type { AuthCredentials, AuthSuccessData, RegisterPayload } from '../types/auth';
import type { User } from '../types/models';
import { apiClient } from './apiClient';
import { readStorage, removeStorage, storageKeys, writeStorage } from './storage';

function persistAuth(data: AuthSuccessData) {
  writeStorage(storageKeys.authToken, data.token);
  writeStorage(storageKeys.authUser, data.user);
}

function clearAuth() {
  removeStorage(storageKeys.authToken);
  removeStorage(storageKeys.authUser);
}

function getStoredToken() {
  return readStorage<string | null>(storageKeys.authToken, null);
}

function getStoredUser() {
  const token = getStoredToken();
  return token ? readStorage<User | null>(storageKeys.authUser, null) : null;
}

export const authService = {
  getCurrentUser(): User | null {
    return getStoredUser();
  },

  getToken(): string | null {
    return getStoredToken();
  },

  async restoreSession(): Promise<User | null> {
    const token = getStoredToken();

    if (!token) {
      clearAuth();
      return null;
    }

    try {
      const response = await apiClient.request<User>('/auth/me');

      writeStorage(storageKeys.authUser, response.data);
      return response.data;
    } catch {
      clearAuth();
      return null;
    }
  },

  async login(payload: AuthCredentials): Promise<ApiResponse<User>> {
    const response = await apiClient.request<AuthSuccessData>('/auth/login', {
      method: 'POST',
      data: payload,
    });

    persistAuth(response.data);

    return {
      success: true,
      message: response.message,
      data: response.data.user,
    };
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<User>> {
    const response = await apiClient.request<AuthSuccessData>('/auth/register', {
      method: 'POST',
      data: payload,
    });

    persistAuth(response.data);

    return {
      success: true,
      message: response.message,
      data: response.data.user,
    };
  },

  async logout() {
    const token = getStoredToken();

    try {
      if (token) {
        await apiClient.request<null>('/auth/logout', {
          method: 'POST',
        });
      }
    } finally {
      clearAuth();
    }
  },
};
