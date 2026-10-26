import type { User } from '@/types/blog';

const TOKEN_KEY = 'blog.token';
const USER_KEY = 'blog.user';

export const AUTH_EXPIRED_EVENT = 'auth:expired';

function safely<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.name === 'string' && typeof v.role === 'string';
}

export const storage = {
  getToken: (): string | null => safely(() => localStorage.getItem(TOKEN_KEY), null),

  getUser: (): User | null =>
    safely(() => {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      return isUser(parsed) ? parsed : null;
    }, null),

  saveSession: (token: string, user: User): void => {
    safely(() => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }, undefined);
  },

  clearSession: (): void => {
    safely(() => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }, undefined);
  },
};
