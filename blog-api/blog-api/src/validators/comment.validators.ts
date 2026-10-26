import { z } from 'zod';

export const postIdParamsSchema = z.object({
  postId: z.string().uuid('Must be a valid UUID'),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
  parentId: z.string().uuid().nullish(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
