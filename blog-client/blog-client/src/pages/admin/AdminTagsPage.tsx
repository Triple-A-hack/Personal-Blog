import { useEffect } from 'react';
import { TaxonomyManager } from '@/components/admin/TaxonomyManager';
import { useCreateTag, useTags } from '@/hooks/queries';

export function AdminTagsPage() {
  const query = useTags();
  const createMutation = useCreateTag();

  useEffect(() => {
    document.title = 'Tags — Inkwell Admin';
  }, []);

  return <TaxonomyManager title="Tags" singular="Tag" query={query} createMutation={createMutation} />;
}
