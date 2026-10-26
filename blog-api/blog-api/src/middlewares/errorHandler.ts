import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import type { ErrorBody } from '../utils/response';

interface PgErrorLike {
  code: string;
  constraint_name?: string;
}

/** Drizzle may wrap driver errors, so walk the `cause` chain looking for a Postgres error. */
function findPgError(err: unknown): PgErrorLike | null {
  let current: unknown = err;
  for (let depth = 0; depth < 5 && current && typeof current === 'object'; depth++) {
    const candidate = current as Record<string, unknown>;
    if (typeof candidate.code === 'string' && /^[0-9A-Z]{5}$/.test(candidate.code)) {
      return {
        code: candidate.code,
        constraint_name:
          typeof candidate.constraint_name === 'string' ? candidate.constraint_name : undefined,
      };
    }
    current = candidate.cause;
  }
  return null;
}

function body(message: string, details?: unknown): ErrorBody {
  return { success: false, error: details === undefined ? { message } : { message, details } };
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(body(err.message, err.details));
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json(body('Validation failed', details));
    return;
  }

  // Malformed JSON bodies / oversized payloads from body-parser.
  const parserErr = err as { type?: string; status?: number };
  if (parserErr.type === 'entity.parse.failed') {
    res.status(400).json(body('Malformed JSON in request body'));
    return;
  }
  if (parserErr.type === 'entity.too.large') {
    res.status(413).json(body('Request body too large'));
    return;
  }

  const pgError = findPgError(err);
  if (pgError) {
    switch (pgError.code) {
      case '23505':
        res.status(409).json(body('Resource already exists', { constraint: pgError.constraint_name }));
        return;
      case '23503':
        res.status(409).json(body('Operation conflicts with a related resource'));
        return;
      case '22P02':
        res.status(400).json(body('Invalid identifier format'));
        return;
      default:
        break;
    }
  }

  console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  res
    .status(500)
    .json(body(env.NODE_ENV === 'production' ? 'Internal server error' : String((err as Error)?.message ?? err)));
};
