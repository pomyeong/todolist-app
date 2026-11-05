import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';
import { FieldError } from '../../components/FieldError';
import { FormError } from '../../components/FormError';
import styles from './LoginForm.module.css';
import { useLogin } from './useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate, isPending, error } = useLogin();
  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <h1>로그인</h1>
      <FormError message={error?.fields ? undefined : error?.message} />
      <div className={styles.field}>
        <label htmlFor="email">이메일</label>
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
        <label htmlFor="password">비밀번호</label>
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
        로그인
      </button>
      <Link to="/signup">회원가입</Link>
    </form>
  );
}
