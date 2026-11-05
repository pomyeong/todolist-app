import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { FieldError } from '../../components/FieldError';
import { FormError } from '../../components/FormError';
import { useT } from '../../i18n';
import styles from './CategoryAddForm.module.css';
import { useCreateCategory } from './useCategories';

export function CategoryAddForm() {
  const t = useT();
  const [name, setName] = useState('');
  const { mutate, isPending, error } = useCreateCategory();
  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    mutate(name, { onSuccess: () => setName('') });
  };
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <FormError message={error?.fields ? undefined : error?.message} />
      <div className={styles.row}>
        <input
          aria-label={t('category.newName')}
          placeholder={t('category.newName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="primary" disabled={isPending}>
          {t('common.add')}
        </button>
      </div>
      <FieldError message={error?.fields?.name} />
    </form>
  );
}
