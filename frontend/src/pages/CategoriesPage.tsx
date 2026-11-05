import { CategoryAddForm } from '../features/categories/CategoryAddForm';
import { CategoryList } from '../features/categories/CategoryList';

export function CategoriesPage() {
  return (
    <div style={{ maxWidth: 640 }}>
      <h1>카테고리</h1>
      <CategoryAddForm />
      <CategoryList />
    </div>
  );
}
