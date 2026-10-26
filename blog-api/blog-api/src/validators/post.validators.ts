import { z } from 'zod';

const uuid = z.string().uuid('Must be a valid UUID');
const statusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const tagIds = z
  .array(uuid)
  .max(20, 'A post can have at most 20 tags')
  .transform((ids) => [...new Set(ids)]);

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.string().trim().min(1).max(120).optional(),
  tag: z.string().trim().min(1).max(120).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export const postSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(255),
});

export const postIdParamSchema = z.object({
  id: uuid,
});

export const createPostSchema = z.object({
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().max(500).nullish(),
  content: z.string().trim().min(1, 'Content is required'),
  coverImage: z.string().url().max(2048).nullish(),
  status: statusEnum.default('DRAFT'),
  categoryId: uuid.nullish(),
  tagIds: tagIds.default([]),
});

export const updatePostSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    excerpt: z.string().trim().max(500).nullable(),
    content: z.string().trim().min(1, 'Content cannot be empty'),
    coverImage: z.string().url().max(2048).nullable(),
    status: statusEnum,
    categoryId: uuid.nullable(),
    tagIds,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
