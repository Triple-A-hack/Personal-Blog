import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { Executor } from '../db';
import { posts } from '../db/schema';
import { AppError } from './AppError';

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/g, '');
}

/** Generates a post slug from the title, appending a random suffix on collision. */
export async function generateUniquePostSlug(executor: Executor, title: string): Promise<string> {
  const base = slugify(title) || 'post';

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${randomBytes(3).toString('hex')}`;
    const existing = await executor
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, candidate))
      .limit(1);
    if (existing.length === 0) return candidate;
  }

  throw new AppError(500, 'Could not generate a unique slug, please try again');
}
