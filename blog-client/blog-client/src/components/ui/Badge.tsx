import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { PostStatus } from '@/types/blog';

type Tone = 'indigo' | 'gray' | 'green' | 'amber';

const TONES: Record<Tone, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  green: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  amber: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
};

export function Badge({ tone = 'gray', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', TONES[tone], className)}>
      {children}
    </span>
  );
}

const STATUS_TONE: Record<PostStatus, Tone> = { PUBLISHED: 'green', DRAFT: 'amber', ARCHIVED: 'gray' };

export function StatusBadge({ status }: { status: PostStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
}
