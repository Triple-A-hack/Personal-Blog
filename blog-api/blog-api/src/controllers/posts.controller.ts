import { and, desc, eq, ilike, inArray, or, sql, type SQL } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { db, type Executor, type Transaction } from '../db';
import { categories, postsToTags, posts, tags, type Tag } from '../db/schema';
import { getAuthUser } from '../middlewares/auth';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { generateUniquePostSlug } from '../utils/slug';
import type { CreatePostInput, ListPostsQuery, UpdatePostInput } from '../validators/post.validators';

const authorColumns = { id: true, name: true, avatarUrl: true } as const;

/** Collapses the junction rows produced by the relational query into a flat `tags` array. */
function flattenTags<T extends { postsToTags: { tag: Tag }[] }>(post: T) {
  const { postsToTags: junction, ...rest } = post;
  return { ...rest, tags: junction.map((row) => row.tag) };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

async function findPostDetail(where: SQL) {
  const row = await db.query.posts.findFirst({
    where,
    with: {
      author: { columns: authorColumns },
      category: true,
      postsToTags: { with: { tag: true } },
    },
  });
  return row ? flattenTags(row) : null;
}

async function assertRelationsExist(
  executor: Executor,
  categoryId: string | null | undefined,
  tagIds: string[],
): Promise<void> {
  if (categoryId) {
    const [category] = await executor
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);
    if (!category) throw new AppError(400, 'Category does not exist');
  }

  if (tagIds.length > 0) {
    const found = await executor.select({ id: tags.id }).from(tags).where(inArray(tags.id, tagIds));
    if (found.length !== tagIds.length) throw new AppError(400, 'One or more tags do not exist');
  }
}

async function insertTagLinks(tx: Transaction, postId: string, tagIds: string[]): Promise<void> {
  if (tagIds.length === 0) return;
  await tx.insert(postsToTags).values(tagIds.map((tagId) => ({ postId, tagId })));
}

function assertCanModify(user: { id: string; role: string }, authorId: string): void {
  if (user.role !== 'ADMIN' && user.id !== authorId) {
    throw new AppError(403, 'You can only modify your own posts');
  }
}

/* ------------------------------ Handlers -------------------------------- */

export async function listPosts(req: Request, res: Response): Promise<void> {
  const { page, limit, category, tag, search } = req.query as unknown as ListPostsQuery;

  const conditions: SQL[] = [eq(posts.status, 'PUBLISHED')];

  if (category) {
    conditions.push(
      inArray(posts.categoryId, db.select({ id: categories.id }).from(categories).where(eq(categories.slug, category))),
    );
  }

  if (tag) {
    conditions.push(
      inArray(
        posts.id,
        db
          .select({ id: postsToTags.postId })
          .from(postsToTags)
          .innerJoin(tags, eq(tags.id, postsToTags.tagId))
          .where(eq(tags.slug, tag)),
      ),
    );
  }

  if (search) {
    const term = `%${escapeLike(search)}%`;
    const searchCondition = or(ilike(posts.title, term), ilike(posts.excerpt, term), ilike(posts.content, term));
    if (searchCondition) conditions.push(searchCondition);
  }

  const where = and(...conditions);
  const offset = (page - 1) * limit;

  const [rows, countRows] = await Promise.all([
    db.query.posts.findMany({
      where,
      columns: { content: false },
      with: {
        author: { columns: authorColumns },
        category: true,
        postsToTags: { with: { tag: true } },
      },
      orderBy: [desc(posts.publishedAt), desc(posts.createdAt)],
      limit,
      offset,
    }),
    db.select({ total: sql<number>`count(*)::int` }).from(posts).where(where),
  ]);

  const total = countRows[0]?.total ?? 0;

  sendSuccess(res, {
    items: rows.map(flattenTags),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getPostBySlug(req: Request, res: Response): Promise<void> {
  const slug = req.params.slug as string;
  const post = await findPostDetail(eq(posts.slug, slug));

  // Unpublished posts are only visible to their author and admins; everyone else gets a 404.
  const viewer = req.user;
  const canSeeUnpublished = viewer && (viewer.role === 'ADMIN' || viewer.id === post?.authorId);
  if (!post || (post.status !== 'PUBLISHED' && !canSeeUnpublished)) {
    throw new AppError(404, 'Post not found');
  }

  sendSuccess(res, post);
}

export async function createPost(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const input = req.body as CreatePostInput;

  const createdId = await db.transaction(async (tx) => {
    await assertRelationsExist(tx, input.categoryId, input.tagIds);

    const slug = await generateUniquePostSlug(tx, input.title);
    const [created] = await tx
      .insert(posts)
      .values({
        title: input.title,
        slug,
        excerpt: input.excerpt ?? null,
        content: input.content,
        coverImage: input.coverImage ?? null,
        status: input.status,
        authorId: user.id,
        categoryId: input.categoryId ?? null,
        publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
      })
      .returning({ id: posts.id });

    if (!created) throw new AppError(500, 'Failed to create post');
    await insertTagLinks(tx, created.id, input.tagIds);
    return created.id;
  });

  const post = await findPostDetail(eq(posts.id, createdId));
  sendSuccess(res, post, 201);
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const id = req.params.id as string;
  const input = req.body as UpdatePostInput;

  const [existing] = await db
    .select({ id: posts.id, authorId: posts.authorId, publishedAt: posts.publishedAt })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) throw new AppError(404, 'Post not found');
  assertCanModify(user, existing.authorId);

  await db.transaction(async (tx) => {
    await assertRelationsExist(tx, input.categoryId, input.tagIds ?? []);

    // Stamp the first time a post becomes published; keep the original date afterwards.
    const publishedAt = input.status === 'PUBLISHED' && !existing.publishedAt ? new Date() : undefined;

    // Drizzle skips `undefined` values in `.set()`, so only provided fields are changed.
    await tx
      .update(posts)
      .set({
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        coverImage: input.coverImage,
        status: input.status,
        categoryId: input.categoryId,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    if (input.tagIds) {
      await tx.delete(postsToTags).where(eq(postsToTags.postId, id));
      await insertTagLinks(tx, id, input.tagIds);
    }
  });

  const post = await findPostDetail(eq(posts.id, id));
  sendSuccess(res, post);
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const id = req.params.id as string;

  const [existing] = await db
    .select({ id: posts.id, authorId: posts.authorId })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) throw new AppError(404, 'Post not found');
  assertCanModify(user, existing.authorId);

  await db.delete(posts).where(eq(posts.id, id));
  sendSuccess(res, { id });
}
