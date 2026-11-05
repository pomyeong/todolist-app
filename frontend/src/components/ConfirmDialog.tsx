import { useEffect } from 'react';
import { useT } from '../i18n';
import styles from './ConfirmDialog.module.css';

interface Props {
  title: string;
  message?: string;
  pending: boolean;
  onConfirm(): void;
  onCancel(): void;
}

export function ConfirmDialog({ title, message, pending, onConfirm, onCancel }: Props) {
  const t = useT();
  useEffect(() => {
    if (pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pending, onCancel]);

  return (
    <div className={styles.backdrop}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={message ? 'confirm-message' : undefined}
      >
        <h2 id="confirm-title" className={styles.title}>
          {title}
        </h2>
        {message && (
          <p id="confirm-message" className={styles.message}>
            {message}
          </p>
        )}
        <div className={styles.actions}>
          <button type="button" disabled={pending} onClick={onCancel}>
            {t('common.cancel')}
          </button>
          <button type="button" className="danger" disabled={pending} onClick={onConfirm}>
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
