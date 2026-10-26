import { MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useAddComment, useComments } from '@/hooks/queries';
import type { Comment } from '@/types/blog';
import { getErrorMessage } from '@/utils/format';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

function countComments(comments: Comment[]): number {
  return comments.reduce((total, c) => total + 1 + countComments(c.replies), 0);
}

export function CommentSection({ postId }: { postId: string }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { data: comments, isLoading, error, refetch } = useComments(postId);
  const addComment = useAddComment(postId);

  return (
    <section aria-labelledby="comments-heading" className="mt-14 border-t border-gray-200 pt-10 dark:border-gray-800">
      <h2 id="comments-heading" className="text-xl font-bold">
        Comments{comments ? ` (${countComments(comments)})` : ''}
      </h2>

      <div className="mt-6">
        {isAuthenticated ? (
          <CommentForm
            label="Add a comment"
            submitLabel="Post comment"
            placeholder="Share your thoughts…"
            onSubmit={(content) => addComment.mutateAsync({ content })}
          />
        ) : (
          <p className="rounded-lg bg-gray-100 p-4 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <Link
              to="/login"
              state={{ from: `${location.pathname}${location.search}` }}
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Sign in
            </Link>{' '}
            to join the conversation.
          </p>
        )}
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="space-y-6" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <ErrorBanner message={getErrorMessage(error)} onRetry={() => void refetch()} />}

        {comments && comments.length === 0 && (
          <EmptyState icon={MessageSquare} title="No comments yet" description="Be the first to start the conversation." />
        )}

        {comments && comments.length > 0 && (
          <ul className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} postId={postId} depth={0} canReply={isAuthenticated} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
