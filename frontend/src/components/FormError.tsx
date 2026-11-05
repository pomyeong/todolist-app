import { useTranslateMessage } from '../i18n';
import styles from './FormError.module.css';

export function FormError({ message }: { message?: string }) {
  const tr = useTranslateMessage();
  if (!message) return null;
  return (
    <p role="alert" className={styles.error}>
      {tr(message)}
    </p>
  );
}
