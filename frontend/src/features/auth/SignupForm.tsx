import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';
import { FieldError } from '../../components/FieldError';
import { FormError } from '../../components/FormError';
import { PASSWORD_MISMATCH } from './messages';
import styles from './SignupForm.module.css';
import { useSignup } from './useAuth';

export function SignupForm() {
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
      <h1>회원가입</h1>
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FieldError message={error?.fields?.password} />
      </div>
      <div className={styles.field}>
        <label htmlFor="confirm">비밀번호 확인</label>
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
        <label htmlFor="name">이름</label>
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
        가입
      </button>
      <p>
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </p>
    </form>
  );
}
