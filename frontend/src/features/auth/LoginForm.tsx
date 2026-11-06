import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';
import { FieldError } from '../../components/FieldError';
import { FormError } from '../../components/FormError';
import { LanguageSelect } from '../../components/LanguageSelect';
import { ThemeSelect } from '../../components/ThemeSelect';
import { useT } from '../../i18n';
import styles from './LoginForm.module.css';
import { useLogin } from './useAuth';

export function LoginForm() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate, isPending, error } = useLogin();
  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className="lang-row">
        <LanguageSelect />
        <ThemeSelect />
      </div>
      <h1 className={styles.title}>{t('auth.login')}</h1>
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FieldError message={error?.fields?.password} />
      </div>
      <button type="submit" className="primary" disabled={isPending}>
        {t('auth.login')}
      </button>
      <Link to="/signup">{t('auth.signup')}</Link>
    </form>
  );
}
