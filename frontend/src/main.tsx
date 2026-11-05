import {
  keepPreviousData,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { ApiError } from './api/types';
import { router } from './app/router';
import { clearSession } from './app/session';
import './styles/global.css';

// 401이면 세션을 비운다. 이동은 RequireAuth가 status=guest를 보고 처리한다.
function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.code === 'UNAUTHORIZED';
}

const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    // PR-L-12, PD-24: 갱신까지 실패한 401은 세션을 비우고 RequireAuth가 /login으로 보낸다(첫 진입 /api/me 제외)
    onError(err, query) {
      if (isUnauthorized(err) && !query.meta?.skipAuthRedirect) clearSession(queryClient);
    },
  }),
  mutationCache: new MutationCache({
    onError(err) {
      if (isUnauthorized(err)) clearSession(queryClient);
    },
  }),
  defaultOptions: {
    queries: { retry: false, placeholderData: keepPreviousData, refetchOnWindowFocus: true },
    mutations: { retry: false },
  },
});

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
