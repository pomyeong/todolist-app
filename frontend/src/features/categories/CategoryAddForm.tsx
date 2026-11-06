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
    // 성공 콜백은 목록 재조회 뒤에 오므로, 그사이 새로 입력한 이름은 지우지 않는다
    const sent = name;
    mutate(sent, { onSuccess: () => setName((cur) => (cur === sent ? '' : cur)) });
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
