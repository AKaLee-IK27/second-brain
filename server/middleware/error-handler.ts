import type { Request, Response, NextFunction } from 'express';
import { FileError } from '../services/file-reader.js';
import { ERROR_CODE_HTTP_STATUS, type ApiErrorResponse, type ErrorCode } from '../types/index.js';

/**
 * Global error handling middleware.
 * Catches all errors and formats them according to the SRS API response format.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction,
): void {
  // Handle our custom FileError instances
  if (err instanceof FileError) {
    const httpStatus = ERROR_CODE_HTTP_STATUS[err.code] ?? 500;
    res.status(httpStatus).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle generic errors
  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR' as ErrorCode,
      message: 'An unexpected server error occurred',
      details: process.env.NODE_ENV === 'development'
        ? { stack: err.stack, message: err.message }
        : undefined,
    },
  });
}
