import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';
import { FieldError } from '../../components/FieldError';
import { FormError } from '../../components/FormError';
import { LanguageSelect } from '../../components/LanguageSelect';
import { ThemeSelect } from '../../components/ThemeSelect';
import { useT } from '../../i18n';
import { PASSWORD_MISMATCH } from './messages';
import styles from './SignupForm.module.css';
import { useSignup } from './useAuth';

export function SignupForm() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const { mutate, isPending, error } = useSignup();
  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const differs = password !== confirm;
    setMismatch(differs);
    if (!differs) mutate({ email, password, name }); // 확인값은 서버로 보내지 않는다(P-24)
  };
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className="lang-row">
        <LanguageSelect />
        <ThemeSelect />
      </div>
      <h1>{t('auth.signup')}</h1>
      <FormError message={error?.fields ? undefined : error?.message} />
      <div className={styles.field}>
        <label htmlFor="email">{t('auth.email')}</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FieldError message={error?.fields?.email} />
      </div>
      <div className={styles.field}>
        <label htmlFor="password">{t('auth.password')}</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FieldError message={error?.fields?.password} />
      </div>
      <div className={styles.field}>
        <label htmlFor="confirm">{t('auth.passwordConfirm')}</label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <FieldError message={mismatch ? PASSWORD_MISMATCH : undefined} />
      </div>
      <div className={styles.field}>
        <label htmlFor="name">{t('auth.name')}</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FieldError message={error?.fields?.name} />
      </div>
      <button type="submit" className="primary" disabled={isPending}>
        {t('auth.signupSubmit')}
      </button>
      <p>
        {t('auth.haveAccount')} <Link to="/login">{t('auth.login')}</Link>
      </p>
    </form>
  );
}
