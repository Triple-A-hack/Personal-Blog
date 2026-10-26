import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import type { LoginInput, RegisterInput } from '../validators/auth.validators';
import { AppError } from '../utils/AppError';
import { signToken } from '../utils/jwt';
import { sendSuccess } from '../utils/response';

const BCRYPT_ROUNDS = 12;
// Compared against when the email is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('timing-attack-mitigation', BCRYPT_ROUNDS);

const publicUserColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  avatarUrl: users.avatarUrl,
  role: users.role,
  createdAt: users.createdAt,
};

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, avatarUrl } = req.body as RegisterInput;

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new AppError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Public registration always creates READER accounts; elevated roles are granted out-of-band.
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, avatarUrl: avatarUrl ?? null, role: 'READER' })
    .returning(publicUserColumns);

  if (!user) throw new AppError(500, 'Failed to create user');

  const token = signToken({ id: user.id, role: user.role });
  sendSuccess(res, { user, token }, 201);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordMatches) throw new AppError(401, 'Invalid email or password');

  const token = signToken({ id: user.id, role: user.role });
  sendSuccess(res, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  });
}
