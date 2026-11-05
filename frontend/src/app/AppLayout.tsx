import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { NavLink, Outlet } from 'react-router';
import { LoadingNotice } from '../components/LoadingNotice';
import { useAuthStore } from '../features/auth/authStore';
import { useLogout } from '../features/auth/useAuth';
import styles from './AppLayout.module.css';

const LINKS = [
  ['/todos', '목록'],
  ['/calendar', '캘린더'],
  ['/categories', '카테고리'],
  ['/me', '내 정보'],
] as const;

export function AppLayout() {
  const name = useAuthStore((s) => s.user?.name);
  const logout = useLogout();
  const fetching = useIsFetching({ predicate: (q) => q.state.data !== undefined });
  const busy = fetching + useIsMutating() > 0;
  return (
    <>
      <header className={styles.header}>
        <span className={styles.name}>{name}</span>
        <button
          type="button"
          className={styles.logout}
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          로그아웃
        </button>
        <nav className={styles.nav} aria-label="주요 메뉴">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} className={styles.link}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className={styles.main}>
        {busy && <LoadingNotice kind="refresh" />}
        <Outlet />
      </main>
    </>
  );
}
