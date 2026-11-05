import { useEffect } from 'react';
import type { Status } from '../../api/types';
import { STATUS_LABEL, STATUSES } from '../../api/types';
import { useFilterStore } from './filterStore';
import styles from './TodoFilters.module.css';
import { useCategoryOptions } from './useTodos';

export function TodoFilters() {
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
        카테고리
        <select
          value={filter.categoryId ?? ''}
          onChange={(e) =>
            setFilter({ categoryId: e.target.value === '' ? undefined : Number(e.target.value) })
          }
        >
          <option value="">전체</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        상태
        <select
          value={filter.status ?? ''}
          onChange={(e) =>
            setFilter({ status: e.target.value === '' ? undefined : (e.target.value as Status) })
          }
        >
          <option value="">전체</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
