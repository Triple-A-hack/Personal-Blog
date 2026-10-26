import { useEffect } from 'react';
import { TaxonomyManager } from '@/components/admin/TaxonomyManager';
import { useCategories, useCreateCategory } from '@/hooks/queries';

export function AdminCategoriesPage() {
  const query = useCategories();
  const createMutation = useCreateCategory();

  useEffect(() => {
    document.title = 'Categories — Inkwell Admin';
  }, []);

  return <TaxonomyManager title="Categories" singular="Category" query={query} createMutation={createMutation} />;
}
