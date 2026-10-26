import { Router } from 'express';
import * as controller from '../controllers/posts.controller';
import { authenticate, optionalAuth, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createPostSchema,
  listPostsQuerySchema,
  postIdParamSchema,
  postSlugParamSchema,
  updatePostSchema,
} from '../validators/post.validators';

export const postsRouter = Router();

postsRouter.get('/', validate(listPostsQuerySchema, 'query'), asyncHandler(controller.listPosts));

postsRouter.get(
  '/:slug',
  optionalAuth,
  validate(postSlugParamSchema, 'params'),
  asyncHandler(controller.getPostBySlug),
);

postsRouter.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'AUTHOR'),
  validate(createPostSchema),
  asyncHandler(controller.createPost),
);

postsRouter.put(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'AUTHOR'),
  validate(postIdParamSchema, 'params'),
  validate(updatePostSchema),
  asyncHandler(controller.updatePost),
);

postsRouter.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'AUTHOR'),
  validate(postIdParamSchema, 'params'),
  asyncHandler(controller.deletePost),
);
