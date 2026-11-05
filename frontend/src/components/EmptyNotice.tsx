import styles from './EmptyNotice.module.css';

export function EmptyNotice() {
  return <p className={styles.notice}>할일이 없습니다.</p>;
}
