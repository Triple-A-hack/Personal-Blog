import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

export type ValidationSource = 'body' | 'query' | 'params';

/**
 * Validates `req[source]` against a Zod schema. On success the parsed (coerced, defaulted,
 * stripped) value replaces the original; on failure the ZodError is forwarded to the error handler.
 */
export const validate =
  (schema: ZodTypeAny, source: ValidationSource = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(result.error);
      return;
    }
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    next();
  };
