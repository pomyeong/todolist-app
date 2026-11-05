import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { FieldError } from '../../components/FieldError';
import { FormError } from '../../components/FormError';
import { useAuthStore } from './authStore';
import styles from './PasswordForm.module.css';
import { useUpdateMe } from './useAuth';

export function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.name ?? '');
  const { mutate, isPending, error } = useUpdateMe();
  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    mutate({ name });
  };
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <h2>내 정보</h2>
      <FormError message={error?.fields ? undefined : error?.message} />
      <div className={styles.field}>
        <label htmlFor="me-email">이메일</label>
        <input id="me-email" type="email" value={user?.email ?? ''} readOnly />
      </div>
      <div className={styles.field}>
        <label htmlFor="me-name">이름</label>
        <input
          id="me-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FieldError message={error?.fields?.name} />
      </div>
      <button type="submit" className="primary" disabled={isPending}>
        저장
      </button>
    </form>
  );
}
