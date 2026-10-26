import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { login as loginRequest, register as registerRequest } from '@/services/api';
import type { AuthResult, LoginInput, RegisterInput, Role, User } from '@/types/blog';
import { isTokenExpired } from '@/utils/jwt';
import { AUTH_EXPIRED_EVENT, storage } from '@/utils/storage';
import { useToast } from './ToastContext';

interface Session {
  user: User | null;
  token: string | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  /** True for ADMIN and AUTHOR, the roles allowed into /admin. */
  isStaff: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function restoreSession(): Session {
  const token = storage.getToken();
  const user = storage.getUser();
  if (!token || !user || isTokenExpired(token)) {
    storage.clearSession();
    return { user: null, token: null };
  }
  return { user, token };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(restoreSession);
  const queryClient = useQueryClient();
  const toast = useToast();

  const applySession = useCallback(
    async ({ user, token }: AuthResult): Promise<User> => {
      storage.saveSession(token, user);
      setSession({ user, token });
      // Draft visibility and dashboard data depend on who is signed in.
      await queryClient.invalidateQueries();
      return user;
    },
    [queryClient],
  );

  const login = useCallback(async (input: LoginInput) => applySession(await loginRequest(input)), [applySession]);
  const register = useCallback(
    async (input: RegisterInput) => applySession(await registerRequest(input)),
    [applySession],
  );

  const logout = useCallback(() => {
    storage.clearSession();
    setSession({ user: null, token: null });
    queryClient.removeQueries({ queryKey: ['admin-posts'] });
    void queryClient.invalidateQueries();
  }, [queryClient]);

  // The API client fires this event when the server rejects the stored token.
  useEffect(() => {
    const onExpired = () => {
      setSession({ user: null, token: null });
      queryClient.removeQueries({ queryKey: ['admin-posts'] });
      toast.info('Your session has expired. Please sign in again.');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [queryClient, toast]);

  const value = useMemo<AuthContextValue>(() => {
    const role = session.user?.role ?? null;
    return {
      user: session.user,
      token: session.token,
      isAuthenticated: Boolean(session.user && session.token),
      role,
      isStaff: role === 'ADMIN' || role === 'AUTHOR',
      login,
      register,
      logout,
    };
  }, [session, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
