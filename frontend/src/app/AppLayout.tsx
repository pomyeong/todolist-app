import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { NavLink, Outlet } from 'react-router';
import { LanguageSelect } from '../components/LanguageSelect';
import { LoadingNotice } from '../components/LoadingNotice';
import { ThemeSelect } from '../components/ThemeSelect';
import { useAuthStore } from '../features/auth/authStore';
import { useLogout } from '../features/auth/useAuth';
import { useT } from '../i18n';
import styles from './AppLayout.module.css';

const LINKS = [
  ['/todos', 'nav.todos'],
  ['/calendar', 'nav.calendar'],
  ['/categories', 'nav.categories'],
  ['/me', 'nav.me'],
] as const;

export function AppLayout() {
  const t = useT();
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
          {t('nav.logout')}
        </button>
        <nav className={styles.nav} aria-label={t('nav.menu')}>
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} className={styles.link}>
              {t(label)}
            </NavLink>
          ))}
          <LanguageSelect />
          <ThemeSelect />
        </nav>
      </header>
      <main className={styles.main}>
        {busy && <LoadingNotice kind="refresh" />}
        <Outlet />
      </main>
    </>
  );
}
