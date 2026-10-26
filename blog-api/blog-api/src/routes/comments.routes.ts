import { Router } from 'express';
import * as controller from '../controllers/comments.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { createCommentSchema, postIdParamsSchema } from '../validators/comment.validators';

// Mounted at /api/posts, so these resolve to /api/posts/:postId/comments
export const commentsRouter = Router();

commentsRouter.get(
  '/:postId/comments',
  validate(postIdParamsSchema, 'params'),
  asyncHandler(controller.getComments),
);

commentsRouter.post(
  '/:postId/comments',
  authenticate,
  requireRole('READER', 'AUTHOR', 'ADMIN'),
  validate(postIdParamsSchema, 'params'),
  validate(createCommentSchema),
  asyncHandler(controller.createComment),
);
