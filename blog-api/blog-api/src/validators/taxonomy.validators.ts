import { z } from 'zod';

export const createTaxonomySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
});

export type CreateTaxonomyInput = z.infer<typeof createTaxonomySchema>;
