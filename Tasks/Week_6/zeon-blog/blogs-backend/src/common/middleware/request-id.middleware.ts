import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

const MAX_REQUEST_ID_LENGTH = 128;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]+$/;

function generateId() {
  return randomUUID();
}

function sanitizeClientRequestId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_REQUEST_ID_LENGTH) return null;
  if (!REQUEST_ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const existing = sanitizeClientRequestId(req.header('x-request-id'));
  const requestId = existing ?? generateId();

  (req as any).requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
