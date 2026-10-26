import jwt, { type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import type { Role } from '../db/schema';

const payloadSchema = z.object({
  sub: z.string().uuid(),
  role: z.enum(['ADMIN', 'AUTHOR', 'READER']),
});

export interface AuthUser {
  id: string;
  role: Role;
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
}

/** Returns the authenticated user, or throws if the token is invalid/expired/malformed. */
export function verifyToken(token: string): AuthUser {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  const payload = payloadSchema.parse(decoded);
  return { id: payload.sub, role: payload.role };
}
