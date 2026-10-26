import axios, { type AxiosError } from 'axios';
import type { ApiFailure } from '@/types/blog';
import { AUTH_EXPIRED_EVENT, storage } from '@/utils/storage';

export interface ApiErrorDetail {
  path: string;
  message: string;
}

/** Normalised error thrown by every API call. */
export class ApiError extends Error {
  public readonly status: number | null;
  public readonly details: ApiErrorDetail[];

  constructor(message: string, status: number | null = null, details: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function parseDetails(details: unknown): ApiErrorDetail[] {
  if (!Array.isArray(details)) return [];
  return details.flatMap((item): ApiErrorDetail[] => {
    if (typeof item !== 'object' || item === null) return [];
    const { path, message } = item as Record<string, unknown>;
    return typeof message === 'string' ? [{ path: typeof path === 'string' ? path : '', message }] : [];
  });
}

function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError(error instanceof Error ? error.message : 'Unexpected error');
  }

  const axiosError = error as AxiosError<Partial<ApiFailure>>;

  if (!axiosError.response) {
    return axiosError.code === 'ECONNABORTED'
      ? new ApiError('The request timed out. Please try again.')
      : new ApiError('Unable to reach the server. Check your connection and try again.');
  }

  const { status, data } = axiosError.response;
  const body = data?.error;
  let message = body?.message ?? axiosError.message;
  const details = parseDetails(body?.details);

  // Surface the first field-level problem for validation errors.
  if (status === 400 && details.length > 0) {
    const first = details[0];
    if (first) message = first.path ? `${first.path}: ${first.message}` : first.message;
  }

  return new ApiError(message, status, details);
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);

    // A 401 while holding a token means the session is no longer valid.
    if (apiError.status === 401 && storage.getToken()) {
      storage.clearSession();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }

    return Promise.reject(apiError);
  },
);
