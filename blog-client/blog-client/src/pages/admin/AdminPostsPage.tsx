import { ExternalLink, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, buttonClasses } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { controlClasses } from '@/components/ui/FormFields';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { useAdminPosts, useDeletePost } from '@/hooks/queries';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { POST_STATUSES, type PostStatus, type PostSummary } from '@/types/blog';
import { cn } from '@/utils/cn';
import { formatDate, getErrorMessage } from '@/utils/format';

const PAGE_SIZE = 10;

export function AdminPostsPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PostStatus | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim(), 400);
  const [pendingDelete, setPendingDelete] = useState<PostSummary | null>(null);

  const { data, isLoading, isPlaceholderData, error, refetch } = useAdminPosts({
    page,
    limit: PAGE_SIZE,
    status: status || undefined,
    search: search || undefined,
  });
  const deletePost = useDeletePost();

  useEffect(() => {
    document.title = 'Posts — Inkwell Admin';
  }, []);

  // Jump back to the first page whenever the filters change.
  useEffect(() => setPage(1), [status, search]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePost.mutateAsync(pendingDelete.id);
      toast.success(`“${pendingDelete.title}” was deleted.`);
      setPendingDelete(null);
      // If that was the last row on the page, step back one page.
      if (data && data.items.length === 1 && page > 1) setPage(page - 1);
    } catch {
      // Global handler shows the error toast; keep the dialog open so the user can retry or cancel.
    }
  };

  const items = data?.items ?? [];
  const filtered = Boolean(status || search);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link to="/admin/posts/new" className={buttonClasses('primary')}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New post
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="admin-post-search" className="sr-only">
            Search posts by title
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="admin-post-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title…"
            className={controlClasses(false, 'pl-9')}
          />
        </div>
        <div>
          <label htmlFor="admin-post-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="admin-post-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as PostStatus | '')}
            className={controlClasses(false, 'sm:w-44')}
          >
            <option value="">All statuses</option>
            {POST_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0) + value.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {error && !data && <ErrorBanner message={getErrorMessage(error)} onRetry={() => void refetch()} />}

        {isLoading && (
          <div className="space-y-2" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <EmptyState
            icon={FileText}
            title={filtered ? 'No posts match your filters' : 'No posts yet'}
            description={filtered ? 'Try a different search term or status.' : 'Write your first post to get started.'}
            action={
              filtered ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStatus('');
                    setSearchInput('');
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Link to="/admin/posts/new" className={buttonClasses('primary')}>
                  Create a post
                </Link>
              )
            }
          />
        )}

        {items.length > 0 && (
          <div className={cn('overflow-x-auto rounded-xl border border-gray-200 bg-white transition-opacity dark:border-gray-800 dark:bg-gray-900', isPlaceholderData && 'opacity-60')}>
            <table className="w-full min-w-[46rem] text-left text-sm">
              <caption className="sr-only">Posts</caption>
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Title</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Author</th>
                  <th scope="col" className="px-4 py-3 font-medium">Category</th>
                  <th scope="col" className="px-4 py-3 font-medium">Published</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {items.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="max-w-xs px-4 py-3">
                      <Link to={`/admin/posts/${post.slug}/edit`} className="line-clamp-2 font-medium hover:text-indigo-600 dark:hover:text-indigo-400">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3">{post.author.name}</td>
                    <td className="whitespace-nowrap px-4 py-3">{post.category?.name ?? <span className="text-gray-400">—</span>}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(post.publishedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/posts/${post.slug}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          aria-label={`View ${post.title}`}
                          title="View"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/posts/${post.slug}/edit`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          aria-label={`Edit ${post.title}`}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(post)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                          aria-label={`Delete ${post.title}`}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={setPage} />}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this post?"
        description={`“${pendingDelete?.title ?? ''}” and all of its comments will be permanently deleted. This can't be undone.`}
        loading={deletePost.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
