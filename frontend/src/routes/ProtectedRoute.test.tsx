import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { storageKeys } from '../services/storage';
import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('redirects anonymous users to login', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/map']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/map" element={<div>Map page</div>} />
            </Route>
            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });

  it('renders children when user is authenticated', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      message: '当前用户资料读取成功',
      data: {
        id: 'user-real-lin',
        name: '林向野',
        email: 'lin@example.com',
      },
    });

    window.localStorage.setItem(storageKeys.authToken, JSON.stringify('token-value'));
    window.localStorage.setItem(
      storageKeys.authUser,
      JSON.stringify({
        id: 'user-real-lin',
        name: '林向野',
        email: 'lin@example.com',
      }),
    );

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/map']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/map" element={<div>Map page</div>} />
            </Route>
            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByText('Map page')).toBeInTheDocument();
  });
});
