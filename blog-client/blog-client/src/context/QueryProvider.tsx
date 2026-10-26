import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef, useState, type ReactNode } from 'react';
import { ApiError } from '@/services/apiClient';
import { getErrorMessage } from '@/utils/format';
import { useToast } from './ToastContext';

/** Creates the QueryClient; any failed mutation raises a global error toast. */
export function QueryProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Never retry client errors (404, 403, ...); retry flaky network/5xx twice.
              if (error instanceof ApiError && error.status !== null && error.status < 500) return false;
              return failureCount < 2;
            },
          },
        },
        mutationCache: new MutationCache({
          onError: (error) => toastRef.current.error(getErrorMessage(error)),
        }),
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
