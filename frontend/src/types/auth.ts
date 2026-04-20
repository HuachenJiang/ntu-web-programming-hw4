import type { User } from './models';
import type { ApiResponse } from './api';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (payload: AuthCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export interface AuthSuccessData {
  user: User;
  token: string;
}

export type AuthSuccessResponse = ApiResponse<AuthSuccessData>;
