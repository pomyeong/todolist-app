import { useT } from '../i18n';
import styles from './EmptyNotice.module.css';

export function EmptyNotice() {
  const t = useT();
  return <p className={styles.notice}>{t('notice.empty')}</p>;
}
