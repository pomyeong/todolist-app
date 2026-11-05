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
import { log, logError } from './lib/log';
import './styles/global.css';

// 401이면 세션을 비운다. 이동은 RequireAuth가 status=guest를 보고 처리한다.
function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.code === 'UNAUTHORIZED';
}

const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    // PR-L-12, PD-24: 갱신까지 실패한 401은 세션을 비우고 RequireAuth가 /login으로 보낸다(첫 진입 /api/me 제외)
    onError(err, query) {
      logError('query', query.queryKey, err);
      if (isUnauthorized(err) && !query.meta?.skipAuthRedirect) clearSession(queryClient);
    },
  }),
  mutationCache: new MutationCache({
    onError(err) {
      logError('mutation', err);
      if (isUnauthorized(err)) clearSession(queryClient);
    },
  }),
  defaultOptions: {
    queries: { retry: false, placeholderData: keepPreviousData, refetchOnWindowFocus: true },
    mutations: { retry: false },
  },
});

// 화면 이동: 로딩 등 다른 상태 변화는 건너뛰고 주소가 바뀔 때만 남긴다
let lastPath = router.state.location.pathname + router.state.location.search;
log('route', lastPath);
router.subscribe(({ location }) => {
  const path = location.pathname + location.search;
  if (path !== lastPath) log('route', path);
  lastPath = path;
});
log('app', '시작', import.meta.env.VITE_API_BASE_URL ?? '(같은 출처 API)');

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
