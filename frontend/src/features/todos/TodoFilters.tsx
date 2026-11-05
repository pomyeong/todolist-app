import { useEffect } from 'react';
import type { Status } from '../../api/types';
import { STATUSES } from '../../api/types';
import { useCategoryLabel, useT } from '../../i18n';
import { useFilterStore } from './filterStore';
import styles from './TodoFilters.module.css';
import { useCategoryOptions } from './useTodos';

export function TodoFilters() {
  const t = useT();
  const categoryLabel = useCategoryLabel();
  const { filter, setFilter } = useFilterStore();
  const { data: categories } = useCategoryOptions();

  // 선택한 카테고리가 사라졌으면 해제
  useEffect(() => {
    if (categories && filter.categoryId !== undefined) {
      if (!categories.some((c) => c.id === filter.categoryId)) {
        setFilter({ categoryId: undefined });
      }
    }
  }, [categories, filter.categoryId, setFilter]);

  return (
    <div className={styles.filters}>
      <label>
        {t('todo.category')}
        <select
          value={filter.categoryId ?? ''}
          onChange={(e) =>
            setFilter({ categoryId: e.target.value === '' ? undefined : Number(e.target.value) })
          }
        >
          <option value="">{t('common.all')}</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {categoryLabel(c.name)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('todo.status')}
        <select
          value={filter.status ?? ''}
          onChange={(e) =>
            setFilter({ status: e.target.value === '' ? undefined : (e.target.value as Status) })
          }
        >
          <option value="">{t('common.all')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
