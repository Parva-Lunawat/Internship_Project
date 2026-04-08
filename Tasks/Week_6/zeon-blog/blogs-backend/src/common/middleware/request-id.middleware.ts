import type { Request, Response, NextFunction } from 'express';

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const existing = req.header('x-request-id');
  const requestId = existing && typeof existing === 'string' ? existing : generateId();

  (req as any).requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

