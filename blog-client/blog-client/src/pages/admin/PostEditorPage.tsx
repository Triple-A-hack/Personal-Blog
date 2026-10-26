import { Compass } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PostForm } from '@/components/admin/PostForm';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePost } from '@/hooks/queries';
import { ApiError } from '@/services/apiClient';
import { getErrorMessage } from '@/utils/format';

/** Dual-mode page: `/admin/posts/new` creates, `/admin/posts/:slug/edit` edits. */
export function PostEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const isEditing = slug !== undefined;
  const { data: post, isLoading, error, refetch } = usePost(slug ?? '');

  useEffect(() => {
    document.title = `${isEditing ? 'Edit post' : 'New post'} — Inkwell Admin`;
  }, [isEditing]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-8 text-2xl font-bold">{isEditing ? 'Edit post' : 'Create post'}</h1>

      {!isEditing && <PostForm />}

      {isEditing && isLoading && (
        <div className="space-y-4" aria-hidden="true">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      )}

      {isEditing && error instanceof ApiError && error.status === 404 && (
        <EmptyState
          icon={Compass}
          title="Post not found"
          description="This post doesn't exist or you don't have access to it."
          action={
            <Link to="/admin/posts" className={buttonClasses('primary')}>
              Back to posts
            </Link>
          }
        />
      )}

      {isEditing && error && !(error instanceof ApiError && error.status === 404) && (
        <ErrorBanner message={getErrorMessage(error)} onRetry={() => void refetch()} />
      )}

      {/* Keyed by id so the form re-initialises if a different post loads. */}
      {isEditing && post && <PostForm key={post.id} post={post} />}
    </div>
  );
}
