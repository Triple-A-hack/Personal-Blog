import { and, asc, eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { db } from '../db';
import { comments, posts, users } from '../db/schema';
import { getAuthUser } from '../middlewares/auth';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import type { CreateCommentInput } from '../validators/comment.validators';

interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface CommentNode {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  user: CommentAuthor;
  replies: CommentNode[];
}

async function assertPublishedPostExists(postId: string): Promise<void> {
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.status, 'PUBLISHED')))
    .limit(1);
  if (!post) throw new AppError(404, 'Post not found');
}

/** Builds a nested tree in O(n) from a flat, chronologically-sorted list. */
function buildCommentTree(flat: Omit<CommentNode, 'replies'>[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  for (const row of flat) nodes.set(row.id, { ...row, replies: [] });

  const roots: CommentNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }
  return roots;
}

export async function getComments(req: Request, res: Response): Promise<void> {
  const postId = req.params.postId as string;
  await assertPublishedPostExists(postId);

  const rows = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      parentId: comments.parentId,
      content: comments.content,
      createdAt: comments.createdAt,
      user: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));

  sendSuccess(res, buildCommentTree(rows));
}

export async function createComment(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const postId = req.params.postId as string;
  const { content, parentId } = req.body as CreateCommentInput;

  await assertPublishedPostExists(postId);

  if (parentId) {
    const [parent] = await db
      .select({ id: comments.id, postId: comments.postId })
      .from(comments)
      .where(eq(comments.id, parentId))
      .limit(1);
    if (!parent) throw new AppError(404, 'Parent comment not found');
    if (parent.postId !== postId) throw new AppError(400, 'Parent comment belongs to a different post');
  }

  const [created] = await db
    .insert(comments)
    .values({ postId, userId: user.id, parentId: parentId ?? null, content })
    .returning();

  if (!created) throw new AppError(500, 'Failed to create comment');

  const [author] = await db
    .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  sendSuccess(res, { ...created, user: author, replies: [] }, 201);
}
