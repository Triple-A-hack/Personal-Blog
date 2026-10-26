import type { Request, RequestHandler } from 'express';
import type { Role } from '../db/schema';
import { AppError } from '../utils/AppError';
import { type AuthUser, verifyToken } from '../utils/jwt';

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

/** Requires a valid JWT and attaches `req.user`. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req);
  if (!token) {
    next(new AppError(401, 'Authentication required'));
    return;
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
};

/** Attaches `req.user` when a valid token is present, but never rejects the request. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req);
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Ignore invalid tokens on public routes; the request proceeds anonymously.
    }
  }
  next();
};

/** Must run after `authenticate`. Allows only the listed roles. */
export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'You do not have permission to perform this action'));
      return;
    }
    next();
  };

/** Typed accessor for handlers mounted behind `authenticate`. */
export function getAuthUser(req: Request): AuthUser {
  if (!req.user) throw new AppError(401, 'Authentication required');
  return req.user;
}
