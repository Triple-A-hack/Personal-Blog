import { FileSearch } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FeaturedPost, FeaturedPostSkeleton, PostCard, PostCardSkeleton } from '@/components/posts/PostCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCategories, usePosts, useTags } from '@/hooks/queries';
import { cn } from '@/utils/cn';
import { getErrorMessage, parsePositiveInt } from '@/utils/format';

const PAGE_SIZE = 9;

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const category = searchParams.get('category') ?? undefined;
  const tag = searchParams.get('tag') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  const postsQuery = usePosts({ page, limit: PAGE_SIZE, category, tag, search });
  const { data: categories = [] } = useCategories();
  const tagsQuery = useTags();

  useEffect(() => {
    document.title = 'Inkwell — Ideas worth reading';
  }, []);

  const updateParams = (changes: Record<string, string | undefined>, keepPage = false) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!keepPage) next.delete('page');
    setSearchParams(next);
  };

  const goToPage = (nextPage: number) => {
    updateParams({ page: nextPage > 1 ? String(nextPage) : undefined }, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasFilters = Boolean(category || tag || search);
  const activeCategory = categories.find((c) => c.slug === category);
  const activeTag = tagsQuery.data?.find((t) => t.slug === tag);

  const items = postsQuery.data?.items ?? [];
  const pagination = postsQuery.data?.pagination;
  const showHero = page === 1 && !search && items.length > 0;
  const featured = showHero ? items[0] : undefined;
  const gridPosts = showHero ? items.slice(1) : items;
  const initialLoading = postsQuery.isLoading;

  let emptyTitle = 'No posts have been published yet';
  let emptyDescription = 'Check back soon, new stories are on the way.';
  if (search) {
    emptyTitle = `No posts match “${search}”`;
    emptyDescription = 'Try a different keyword or clear your filters.';
  } else if (category) {
    emptyTitle = 'No posts found in this category';
    emptyDescription = `There's nothing in ${activeCategory?.name ?? 'this category'} yet.`;
  } else if (tag) {
    emptyTitle = 'No posts found with this tag';
    emptyDescription = `Nothing is tagged ${activeTag?.name ?? 'with this tag'} yet.`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ideas worth reading</h1>
        <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
          Stories, tutorials and deep dives from our writers.
        </p>
      </div>

      <div role="tablist" aria-label="Filter by category" className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {[{ id: 'all', name: 'All', slug: undefined as string | undefined }, ...categories].map((item) => {
          const selected = (item.slug ?? undefined) === category;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => updateParams({ category: item.slug })}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                selected
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800',
              )}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section aria-label="Posts" aria-busy={postsQuery.isFetching}>
          {hasFilters && (
            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>
                {pagination ? `${pagination.total} result${pagination.total === 1 ? '' : 's'}` : 'Filtering'}
                {search && <> for “{search}”</>}
                {activeTag && <> tagged <strong>{activeTag.name}</strong></>}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setSearchParams(new URLSearchParams())}>
                Clear filters
              </Button>
            </div>
          )}

          {postsQuery.error && !postsQuery.data && (
            <ErrorBanner message={getErrorMessage(postsQuery.error)} onRetry={() => void postsQuery.refetch()} />
          )}

          {initialLoading && (
            <div className="space-y-8">
              {page === 1 && !search && <FeaturedPostSkeleton />}
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            </div>
          )}

          {!initialLoading && !postsQuery.error && items.length === 0 && (
            <EmptyState
              icon={FileSearch}
              title={emptyTitle}
              description={emptyDescription}
              action={
                hasFilters ? (
                  <Button variant="secondary" onClick={() => setSearchParams(new URLSearchParams())}>
                    View all posts
                  </Button>
                ) : undefined
              }
            />
          )}

          {items.length > 0 && (
            <div className={cn('space-y-8 transition-opacity', postsQuery.isPlaceholderData && 'opacity-60')}>
              {featured && <FeaturedPost post={featured} />}
              {gridPosts.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {gridPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
              {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={goToPage} />}
            </div>
          )}
        </section>

        <aside aria-label="Tags" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-semibold">Browse by tag</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {tagsQuery.isLoading &&
                [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-7 w-16 rounded-full" />)}
              {tagsQuery.error && <p className="text-sm text-red-600 dark:text-red-400">Couldn't load tags.</p>}
              {tagsQuery.data?.length === 0 && <p className="text-sm text-gray-500">No tags yet.</p>}
              {tagsQuery.data?.map((item) => {
                const selected = item.slug === tag;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => updateParams({ tag: selected ? undefined : item.slug })}
                    className={cn(
                      'rounded-full border px-3 py-1 text-sm transition-colors',
                      selected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
                    )}
                  >
                    #{item.name}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
