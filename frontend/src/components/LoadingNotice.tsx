import { useT } from '../i18n';
import styles from './LoadingNotice.module.css';

export function LoadingNotice({ kind }: { kind: 'initial' | 'refresh' }) {
  const t = useT();
  return (
    <p role="status" className={styles.notice}>
      {kind === 'initial' ? t('notice.loading') : t('notice.refreshing')}
    </p>
  );
}
