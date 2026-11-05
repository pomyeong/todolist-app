import { CategoryAddForm } from '../features/categories/CategoryAddForm';
import { CategoryList } from '../features/categories/CategoryList';
import { useT } from '../i18n';

export function CategoriesPage() {
  const t = useT();
  return (
    <div style={{ maxWidth: 640 }}>
      <h1>{t('category.title')}</h1>
      <CategoryAddForm />
      <CategoryList />
    </div>
  );
}
