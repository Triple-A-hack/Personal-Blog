import DOMPurify from 'dompurify';
import { ArrowLeft, Compass, Pencil } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CommentSection } from '@/components/comments/CommentSection';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { usePost } from '@/hooks/queries';
import { ApiError } from '@/services/apiClient';
import { formatDate, getErrorMessage } from '@/utils/format';

function PostSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="aspect-[16/9] w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function PostDetailsPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { user, role } = useAuth();
  const { data: post, isLoading, error, refetch } = usePost(slug);

  const safeHtml = useMemo(() => (post ? DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } }) : ''), [post]);

  useEffect(() => {
    document.title = post ? `${post.title} — Inkwell` : 'Inkwell';
  }, [post]);

  const canEdit = Boolean(post && user && (role === 'ADMIN' || (role === 'AUTHOR' && post.authorId === user.id)));
  const notFound = error instanceof ApiError && error.status === 404;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All posts
      </Link>

      {isLoading && <PostSkeleton />}

      {notFound && (
        <EmptyState
          icon={Compass}
          title="Post not found"
          description="This post doesn't exist, or it hasn't been published yet."
          action={
            <Link to="/" className={buttonClasses('primary')}>
              Browse posts
            </Link>
          }
        />
      )}

      {error && !notFound && <ErrorBanner message={getErrorMessage(error)} onRetry={() => void refetch()} />}

      {post && (
        <article>
          {post.status !== 'PUBLISHED' && (
            <p role="status" className="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              This post is <strong>{post.status.toLowerCase()}</strong> and only visible to you.
            </p>
          )}

          <header>
            <div className="flex flex-wrap items-center gap-2">
              {post.category && (
                <Link to={`/?category=${encodeURIComponent(post.category.slug)}`}>
                  <Badge tone="indigo">{post.category.name}</Badge>
                </Link>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
            {post.excerpt && <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{post.excerpt}</p>}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={post.author.name} src={post.author.avatarUrl} size="lg" />
                <div className="text-sm">
                  <p className="font-semibold">{post.author.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">
                    <time dateTime={post.publishedAt ?? post.createdAt}>{formatDate(post.publishedAt ?? post.createdAt)}</time>
                    {post.updatedAt !== post.createdAt && post.status === 'PUBLISHED' && <> · Updated {formatDate(post.updatedAt)}</>}
                  </p>
                </div>
              </div>
              {canEdit && (
                <Link to={`/admin/posts/${post.slug}/edit`} className={buttonClasses('secondary', 'sm')}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit post
                </Link>
              )}
            </div>
          </header>

          {post.coverImage && (
            <img src={post.coverImage} alt="" className="mt-8 aspect-[16/9] w-full rounded-xl object-cover" />
          )}

          <div
            className="prose prose-lg mt-8 max-w-none dark:prose-invert prose-a:text-indigo-600 dark:prose-a:text-indigo-400"
            // Sanitised with DOMPurify above, so author-supplied HTML cannot inject scripts.
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />

          {post.tags.length > 0 && (
            <ul aria-label="Tags" className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    to={`/?tag=${encodeURIComponent(tag.slug)}`}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
                  >
                    #{tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {post.status === 'PUBLISHED' && <CommentSection postId={post.id} />}
        </article>
      )}
    </div>
  );
}
