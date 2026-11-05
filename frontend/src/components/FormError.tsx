import styles from './FormError.module.css';

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className={styles.error}>
      {message}
    </p>
  );
}
