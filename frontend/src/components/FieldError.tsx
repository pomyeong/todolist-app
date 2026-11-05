import { useTranslateMessage } from '../i18n';
import styles from './FieldError.module.css';

export function FieldError({ message }: { message?: string }) {
  const tr = useTranslateMessage();
  if (!message) return null;
  return (
    <p className={styles.error} data-field-error>
      {tr(message)}
    </p>
  );
}
