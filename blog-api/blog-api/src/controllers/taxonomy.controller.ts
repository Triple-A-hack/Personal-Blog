import { asc, eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import type { AnyPgTable } from 'drizzle-orm/pg-core';
import { db } from '../db';
import { categories, tags } from '../db/schema';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { slugify } from '../utils/slug';
import type { CreateTaxonomyInput } from '../validators/taxonomy.validators';

type TaxonomyTable = typeof categories | typeof tags;

function makeHandlers(table: TaxonomyTable, label: string) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const rows = await db.select().from(table as AnyPgTable & TaxonomyTable).orderBy(asc(table.name));
      sendSuccess(res, rows);
    },

    create: async (req: Request, res: Response): Promise<void> => {
      const { name } = req.body as CreateTaxonomyInput;
      const slug = slugify(name);
      if (!slug) throw new AppError(400, `${label} name must contain letters or numbers`);

      const [existing] = await db
        .select({ id: table.id })
        .from(table as AnyPgTable & TaxonomyTable)
        .where(eq(table.slug, slug))
        .limit(1);
      if (existing) throw new AppError(409, `A ${label.toLowerCase()} with this name already exists`);

      const [created] = await db.insert(table).values({ name, slug }).returning();
      sendSuccess(res, created, 201);
    },
  };
}

const category = makeHandlers(categories, 'Category');
const tag = makeHandlers(tags, 'Tag');

export const listCategories = category.list;
export const createCategory = category.create;
export const listTags = tag.list;
export const createTag = tag.create;
