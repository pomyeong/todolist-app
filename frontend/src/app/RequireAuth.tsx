import { Navigate, Outlet } from 'react-router';
import { LoadingNotice } from '../components/LoadingNotice';
import { useAuthStore } from '../features/auth/authStore';
import { useAuthBootstrap } from '../features/auth/useAuth';

export function RequireAuth({ mode }: { mode: 'authed' | 'guest' }) {
  useAuthBootstrap();
  const status = useAuthStore((s) => s.status);
  // P-23, BR-01: 보호 경로는 비로그인 시 /login, 로그인 상태의 /login·/signup은 /todos
  if (status === 'unknown') return <LoadingNotice kind="initial" />;
  if (mode === 'authed' && status === 'guest') return <Navigate to="/login" replace />;
  if (mode === 'guest' && status === 'authed') return <Navigate to="/todos" replace />;
  return <Outlet />;
}
