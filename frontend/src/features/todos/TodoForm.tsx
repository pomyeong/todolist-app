import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import type { ApiError, TodoInput } from '../../api/types';
import { FieldError } from '../../components/FieldError';
import { FormError } from '../../components/FormError';
import { useCategoryLabel, useT } from '../../i18n';
import styles from './TodoForm.module.css';
import { useCategoryOptions } from './useTodos';

interface Props {
  initial: TodoInput;
  error: ApiError | null;
  pending: boolean;
  onSubmit(input: TodoInput): void;
  onCancel(): void;
}

export function TodoForm({ initial, error, pending, onSubmit, onCancel }: Props) {
  const t = useT();
  const categoryLabel = useCategoryLabel();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [startTime, setStartTime] = useState(initial.startTime ?? '');
  const [endTime, setEndTime] = useState(initial.endTime ?? '');
  const [categoryId, setCategoryId] = useState(initial.categoryId?.toString() ?? '');
  const { data: categories } = useCategoryOptions();
  const fields = error?.fields;

  const submit = (e: SyntheticEvent) => {
    e.preventDefault();
    const input: TodoInput = {
      title,
      description,
      startDate,
      endDate,
      startTime: startTime || null,
      endTime: endTime || null,
    };
    if (categoryId !== '') input.categoryId = Number(categoryId);
    onSubmit(input);
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <FormError message={fields ? undefined : error?.message} />
      <div className={styles.field}>
        <label htmlFor="title">{t('todo.title')}</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <FieldError message={fields?.title} />
      </div>
      <div className={styles.field}>
        <label htmlFor="description">{t('todo.description')}</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <FieldError message={fields?.description} />
      </div>
      <div className={styles.dates}>
        <div className={styles.field}>
          <label htmlFor="startDate">{t('todo.startDate')}</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <FieldError message={fields?.startDate} />
        </div>
        <div className={styles.field}>
          <label htmlFor="endDate">{t('todo.endDate')}</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <FieldError message={fields?.endDate} />
        </div>
        <div className={styles.field}>
          <label htmlFor="startTime">{t('todo.startTime')}</label>
          <input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <FieldError message={fields?.startTime} />
        </div>
        <div className={styles.field}>
          <label htmlFor="endTime">{t('todo.endTime')}</label>
          <input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <FieldError message={fields?.endTime} />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="categoryId">{t('todo.category')}</label>
        <select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">{t('common.none')}</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {categoryLabel(c.name)}
            </option>
          ))}
        </select>
        <FieldError message={fields?.categoryId} />
      </div>
      <div className={styles.actions}>
        <button type="submit" className="primary" disabled={pending}>
          {t('common.save')}
        </button>
        <button type="button" disabled={pending} onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}
