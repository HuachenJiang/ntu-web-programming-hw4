import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('shows validation errors when required fields are missing', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: '进入地图规划' }));

    expect(await screen.findByText('请输入邮箱')).toBeInTheDocument();
    expect(await screen.findByText('请输入密码')).toBeInTheDocument();
  });

  it('logs in with backend credentials and navigates to the map page', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, 'request').mockResolvedValue({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: 'user-real-lin',
          name: '林向野',
          email: 'lin@example.com',
        },
        token: 'token-value',
      },
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/map" element={<div>Map page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText('邮箱'), 'lin@example.com');
    await user.type(screen.getByLabelText('密码'), 'trail123');
    await user.click(screen.getByRole('button', { name: '进入地图规划' }));

    expect(await screen.findByText('Map page')).toBeInTheDocument();
  });
});
