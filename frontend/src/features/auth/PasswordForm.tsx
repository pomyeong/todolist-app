import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { FieldError } from '../../components/FieldError';
import { FormError } from '../../components/FormError';
import { useT } from '../../i18n';
import { PASSWORD_MISMATCH } from './messages';
import styles from './PasswordForm.module.css';
import { useChangePassword } from './useAuth';

export function PasswordForm() {
  const t = useT();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const { mutate, reset, isPending, error } = useChangePassword();
  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const differs = next !== confirm;
    setMismatch(differs);
    if (differs) return reset(); // 확인값은 서버로 보내지 않는다(P-24). 이전 서버 오류는 지운다
    mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess() {
          setCurrent('');
          setNext('');
          setConfirm('');
        },
      },
    );
  };
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <h2>{t('me.passwordTitle')}</h2>
      <FormError message={error?.fields ? undefined : error?.message} />
      <div className={styles.field}>
        <label htmlFor="pw-current">{t('me.currentPassword')}</label>
        <input
          id="pw-current"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <FieldError message={error?.fields?.currentPassword} />
      </div>
      <div className={styles.field}>
        <label htmlFor="pw-new">{t('me.newPassword')}</label>
        <input
          id="pw-new"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <FieldError message={error?.fields?.newPassword} />
      </div>
      <div className={styles.field}>
        <label htmlFor="pw-confirm">{t('me.newPasswordConfirm')}</label>
        <input
          id="pw-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <FieldError message={mismatch ? PASSWORD_MISMATCH : undefined} />
      </div>
      <button type="submit" className="primary" disabled={isPending}>
        {t('me.passwordTitle')}
      </button>
    </form>
  );
}
