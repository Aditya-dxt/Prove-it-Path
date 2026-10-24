import type { Request, Response, NextFunction } from 'express';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export function createApiError(status: number, message: string, code?: string): ApiError {
  return { status, message, code };
}

export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[server] Error:', err);

  if ('status' in err && typeof err.status === 'number') {
    res.status(err.status).json({
      error: err.message,
      code: 'code' in err ? err.code : undefined,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
