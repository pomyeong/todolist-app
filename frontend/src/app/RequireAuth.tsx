import { Navigate, Outlet } from 'react-router';
import { LoadingNotice } from '../components/LoadingNotice';
import { useAuthStore } from '../features/auth/authStore';
import { useAuthBootstrap } from '../features/auth/useAuth';

export function RequireAuth({ mode }: { mode: 'authed' | 'guest' }) {
  useAuthBootstrap();
  const status = useAuthStore((s) => s.status);
  if (status === 'unknown') return <LoadingNotice kind="initial" />;
  if (mode === 'authed' && status === 'guest') return <Navigate to="/login" replace />;
  if (mode === 'guest' && status === 'authed') return <Navigate to="/todos" replace />;
  return <Outlet />;
}
