import { Router } from 'express';
import * as controller from '../controllers/taxonomy.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { createTaxonomySchema } from '../validators/taxonomy.validators';

export const taxonomyRouter = Router();

taxonomyRouter.get('/categories', asyncHandler(controller.listCategories));
taxonomyRouter.post(
  '/categories',
  authenticate,
  requireRole('ADMIN'),
  validate(createTaxonomySchema),
  asyncHandler(controller.createCategory),
);

taxonomyRouter.get('/tags', asyncHandler(controller.listTags));
taxonomyRouter.post(
  '/tags',
  authenticate,
  requireRole('ADMIN'),
  validate(createTaxonomySchema),
  asyncHandler(controller.createTag),
);
