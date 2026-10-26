import { zodResolver } from '@hookform/resolvers/zod';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { Plus, Tag as TagIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { TextField } from '@/components/ui/FormFields';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Category, Tag } from '@/types/blog';
import { getErrorMessage } from '@/utils/format';

const nameSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
});
type NameValues = z.infer<typeof nameSchema>;

interface TaxonomyManagerProps {
  title: string;
  singular: string;
  query: UseQueryResult<(Category | Tag)[]>;
  createMutation: UseMutationResult<Category | Tag, Error, string>;
}

export function TaxonomyManager({ title, singular, query, createMutation }: TaxonomyManagerProps) {
  const { role } = useAuth();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NameValues>({ resolver: zodResolver(nameSchema), defaultValues: { name: '' } });

  const onSubmit = handleSubmit(async ({ name }) => {
    try {
      await createMutation.mutateAsync(name);
      toast.success(`${singular} “${name}” created.`);
      reset();
    } catch {
      // Error toast comes from the global mutation handler.
    }
  });

  const { data, isLoading, error, refetch } = query;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        {role === 'ADMIN' ? (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <TextField label={`New ${singular.toLowerCase()}`} placeholder={`e.g. ${singular === 'Category' ? 'Engineering' : 'react'}`} error={errors.name?.message} {...register('name')} />
            </div>
            <Button type="submit" loading={isSubmitting} className="sm:mt-[1.65rem]">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add {singular.toLowerCase()}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Only administrators can create {title.toLowerCase()}. You can pick from the list below when writing a post.
          </p>
        )}
      </div>

      <div className="mt-6">
        {error && <ErrorBanner message={getErrorMessage(error)} onRetry={() => void refetch()} />}

        {isLoading && (
          <div className="space-y-2" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <EmptyState icon={TagIcon} title={`No ${title.toLowerCase()} yet`} description={role === 'ADMIN' ? `Add your first ${singular.toLowerCase()} using the form above.` : undefined} />
        )}

        {data && data.length > 0 && (
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
            {data.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <span className="font-medium">{item.name}</span>
                <code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{item.slug}</code>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
