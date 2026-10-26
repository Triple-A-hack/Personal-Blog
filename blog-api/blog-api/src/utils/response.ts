import type { Response } from 'express';

export interface SuccessBody<T> {
  success: true;
  data: T;
}

export interface ErrorBody {
  success: false;
  error: { message: string; details?: unknown };
}

export function sendSuccess<T>(res: Response, data: T, status = 200): Response<SuccessBody<T>> {
  return res.status(status).json({ success: true, data });
}
