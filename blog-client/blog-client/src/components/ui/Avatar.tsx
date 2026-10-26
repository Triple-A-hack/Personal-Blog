import { useState } from 'react';
import { cn } from '@/utils/cn';
import { initials } from '@/utils/format';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' } as const;

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const base = cn('inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full', SIZES[size], className);

  if (src && !failed) {
    return <img src={src} alt={`${name}'s avatar`} className={cn(base, 'object-cover')} onError={() => setFailed(true)} />;
  }
  return (
    <span
      role="img"
      aria-label={`${name}'s avatar`}
      className={cn(base, 'bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200')}
    >
      {initials(name)}
    </span>
  );
}
