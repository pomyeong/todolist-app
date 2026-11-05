import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { FieldError } from '../../components/FieldError';
import { FormError } from '../../components/FormError';
import { LoadingNotice } from '../../components/LoadingNotice';
import { useCategoryLabel, useT } from '../../i18n';
import styles from './CategoryList.module.css';
import { useCategories, useDeleteCategory, useRenameCategory } from './useCategories';

export function CategoryList() {
  const t = useT();
  const categoryLabel = useCategoryLabel();
  const { data, isPending, error: listError } = useCategories();
  const rename = useRenameCategory();
  const del = useDeleteCategory();
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState<{ id: number; name: string } | null>(null);

  const onSave = (e: SyntheticEvent) => {
    e.preventDefault();
    if (editing) rename.mutate(editing, { onSuccess: () => setEditing(null) });
  };
  const onConfirmDelete = () => {
    if (deleting) del.mutate(deleting.id, { onSettled: () => setDeleting(null) });
  };
  // 편집을 닫으면 그 편집의 오류도 지운다(남은 409 문구 방지)
  const closeEdit = () => {
    rename.reset();
    setEditing(null);
  };
  const topError = listError ?? del.error ?? rename.error;

  return (
    <>
      <FormError message={topError?.fields ? undefined : topError?.message} />
      {isPending && <LoadingNotice kind="initial" />}
      <ul className={styles.list}>
        {data?.map((c) => (
          <li key={c.id} className={styles.item}>
            {editing?.id === c.id ? (
              <form className={styles.row} onSubmit={onSave} noValidate>
                <div className={styles.name}>
                  <input
                    aria-label={t('category.name')}
                    // biome-ignore lint/a11y/noAutofocus: 사용자가 누른 '수정'으로 열린 입력란이라 포커스 이동이 예상된 동작이다(L-14)
                    autoFocus
                    value={editing.name}
                    onChange={(e) => setEditing({ id: c.id, name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Escape' && closeEdit()}
                  />
                  <FieldError message={rename.error?.fields?.name} />
                </div>
                <button type="submit" className="primary" disabled={rename.isPending}>
                  {t('common.save')}
                </button>
                <button type="button" disabled={rename.isPending} onClick={closeEdit}>
                  {t('common.close')}
                </button>
              </form>
            ) : (
              <div className={styles.row}>
                <span className={styles.name}>{categoryLabel(c.name)}</span>
                <button
                  type="button"
                  // BR-12: 기본 카테고리는 수정·삭제 조작 비활성
                  disabled={c.isDefault}
                  onClick={() => {
                    rename.reset();
                    setEditing({ id: c.id, name: c.name });
                  }}
                >
                  {t('common.edit')}
                </button>
                <button
                  type="button"
                  disabled={c.isDefault || del.isPending}
                  onClick={() => {
                    del.reset();
                    setDeleting({ id: c.id, name: c.name });
                  }}
                >
                  {t('common.delete')}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {deleting && (
        <ConfirmDialog
          title={t('category.deleteConfirm')(deleting.name)}
          // P-19, BR-14: 삭제 시 소속 할일 이동 안내
          message={t('category.deleteNote')}
          pending={del.isPending}
          onConfirm={onConfirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
