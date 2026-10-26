import { Reply } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { useAddComment } from '@/hooks/queries';
import type { Comment } from '@/types/blog';
import { cn } from '@/utils/cn';
import { formatDate, formatRelative } from '@/utils/format';
import { CommentForm } from './CommentForm';

/** Beyond this depth replies stop indenting so deep threads stay readable on phones. */
const MAX_INDENT_DEPTH = 4;

interface CommentItemProps {
  comment: Comment;
  postId: string;
  depth: number;
  canReply: boolean;
}

export function CommentItem({ comment, postId, depth, canReply }: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const addComment = useAddComment(postId);

  return (
    <li className="list-none">
      <div className="flex gap-3">
        <Avatar name={comment.user.name} src={comment.user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <span className="font-semibold">{comment.user.name}</span>
            <time
              dateTime={comment.createdAt}
              title={formatDate(comment.createdAt)}
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              {formatRelative(comment.createdAt)}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>

          {canReply && !replying && (
            <button
              type="button"
              onClick={() => setReplying(true)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
            >
              <Reply className="h-3.5 w-3.5" aria-hidden="true" />
              Reply
              <span className="sr-only"> to {comment.user.name}</span>
            </button>
          )}

          {replying && (
            <div className="mt-3">
              <CommentForm
                label={`Reply to ${comment.user.name}`}
                submitLabel="Post reply"
                autoFocus
                onSubmit={(content) => addComment.mutateAsync({ content, parentId: comment.id })}
                onCancel={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <ul
          className={cn(
            'mt-4 space-y-4',
            depth < MAX_INDENT_DEPTH && 'ml-4 border-l border-gray-200 pl-4 sm:ml-6 sm:pl-6 dark:border-gray-800',
          )}
        >
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} canReply={canReply} />
          ))}
        </ul>
      )}
    </li>
  );
}
