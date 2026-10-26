import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, queryClient } from './index';
import { users } from './schema';

const seedSchema = z.object({
  SEED_ADMIN_NAME: z.string().min(2).default('Admin'),
  SEED_ADMIN_EMAIL: z.string().email(),
  SEED_ADMIN_PASSWORD: z.string().min(8),
});

async function main(): Promise<void> {
  const cfg = seedSchema.parse(process.env);
  const passwordHash = await bcrypt.hash(cfg.SEED_ADMIN_PASSWORD, 12);

  const inserted = await db
    .insert(users)
    .values({
      name: cfg.SEED_ADMIN_NAME,
      email: cfg.SEED_ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: 'ADMIN',
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  console.log(inserted.length ? 'Admin user created.' : 'Admin user already exists, nothing to do.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => queryClient.end());
