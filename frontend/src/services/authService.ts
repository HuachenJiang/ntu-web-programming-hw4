import type { ApiResponse } from '../types/api';
import type { AuthCredentials, RegisterPayload } from '../types/auth';
import type { User } from '../types/models';
import { createId } from '../utils/id';
import { demoUsers, type MockStoredUser } from './mockData';
import { readStorage, storageKeys, writeStorage } from './storage';

function readUsers() {
  const storedUsers = readStorage<MockStoredUser[]>(storageKeys.users, demoUsers);

  if (!storedUsers.length) {
    writeStorage(storageKeys.users, demoUsers);
    return demoUsers;
  }

  return storedUsers;
}

function sanitizeUser(user: MockStoredUser): User {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export const authService = {
  getCurrentUser(): User | null {
    return readStorage<User | null>(storageKeys.authUser, null);
  },

  async login(payload: AuthCredentials): Promise<ApiResponse<User>> {
    const user = readUsers().find(
      (item) =>
        item.email.toLowerCase() === payload.email.toLowerCase() && item.password === payload.password,
    );

    if (!user) {
      throw new Error('邮箱或密码不正确，可使用 demo@hikelog.test / trail123');
    }

    const safeUser = sanitizeUser(user);
    writeStorage(storageKeys.authUser, safeUser);

    return {
      success: true,
      message: '登录成功',
      data: safeUser,
    };
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<User>> {
    const users = readUsers();
    const exists = users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase());

    if (exists) {
      throw new Error('这个邮箱已经注册过了');
    }

    const user: MockStoredUser = {
      id: createId('user'),
      name: payload.name,
      email: payload.email,
      password: payload.password,
    };

    const nextUsers = [...users, user];
    writeStorage(storageKeys.users, nextUsers);
    const safeUser = sanitizeUser(user);
    writeStorage(storageKeys.authUser, safeUser);

    return {
      success: true,
      message: '注册成功',
      data: safeUser,
    };
  },

  logout() {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(storageKeys.authUser);
  },
};
