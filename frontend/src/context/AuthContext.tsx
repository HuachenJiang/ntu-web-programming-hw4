import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { authService } from '../services/authService';
import type { AuthContextValue } from '../types/auth';
import type { User } from '../types/models';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    authService.restoreSession().then((nextUser) => {
      setUser(nextUser);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      async login(payload) {
        const response = await authService.login(payload);
        setUser(response.data);
      },
      async register(payload) {
        const response = await authService.register(payload);
        setUser(response.data);
      },
      async logout() {
        await authService.logout();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
