import { ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PostSummary } from '@/types/blog';
import { formatDate } from '@/utils/format';

function CoverImage({ post, className }: { post: PostSummary; className: string }) {
  return (
    <Link to={`/posts/${post.slug}`} tabIndex={-1} aria-hidden="true" className={`block overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
      {post.coverImage ? (
        <img
          src={post.coverImage}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-300 dark:from-indigo-950 dark:to-purple-950 dark:text-indigo-800">
          <ImageIcon className="h-10 w-10" />
        </div>
      )}
    </Link>
  );
}

function Meta({ post }: { post: PostSummary }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <Avatar name={post.author.name} src={post.author.avatarUrl} size="sm" />
      <span className="font-medium text-gray-700 dark:text-gray-300">{post.author.name}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.publishedAt ?? post.createdAt}>{formatDate(post.publishedAt ?? post.createdAt)}</time>
    </div>
  );
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <CoverImage post={post} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.category && (
          <Link to={`/?category=${encodeURIComponent(post.category.slug)}`} className="self-start">
            <Badge tone="indigo">{post.category.name}</Badge>
          </Link>
        )}
        <h3 className="text-lg font-semibold leading-snug">
          <Link to={`/posts/${post.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{post.excerpt}</p>}
        <div className="mt-auto pt-2">
          <Meta post={post} />
        </div>
      </div>
    </article>
  );
}

export function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <article className="group grid overflow-hidden rounded-2xl border border-gray-200 bg-white md:grid-cols-2 dark:border-gray-800 dark:bg-gray-900">
      <CoverImage post={post} className="aspect-[16/10] md:aspect-auto md:min-h-[20rem]" />
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="amber">Featured</Badge>
          {post.category && (
            <Link to={`/?category=${encodeURIComponent(post.category.slug)}`}>
              <Badge tone="indigo">{post.category.name}</Badge>
            </Link>
          )}
        </div>
        <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
          <Link to={`/posts/${post.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className="line-clamp-4 text-gray-600 dark:text-gray-400">{post.excerpt}</p>}
        <Meta post={post} />
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" aria-hidden="true">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedPostSkeleton() {
  return (
    <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white md:grid-cols-2 dark:border-gray-800 dark:bg-gray-900" aria-hidden="true">
      <Skeleton className="aspect-[16/10] w-full rounded-none md:min-h-[20rem]" />
      <div className="space-y-4 p-8">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}
