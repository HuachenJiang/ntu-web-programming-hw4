import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { storageKeys } from '../services/storage';
import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    window.localStorage.clear();
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
    window.localStorage.setItem(
      storageKeys.authUser,
      JSON.stringify({
        id: 'user-demo-lin',
        name: '林向野',
        email: 'demo@hikelog.test',
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
