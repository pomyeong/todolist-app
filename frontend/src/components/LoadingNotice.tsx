import styles from './LoadingNotice.module.css';

export function LoadingNotice({ kind }: { kind: 'initial' | 'refresh' }) {
  return (
    <p role="status" className={styles.notice}>
      {kind === 'initial' ? '불러오는 중…' : '갱신 중…'}
    </p>
  );
}
