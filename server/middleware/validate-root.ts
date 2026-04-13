import type { Request, Response, NextFunction } from 'express';
import { getDataRoot } from '../config.js';
import { validateDirectory } from '../services/file-reader.js';
import type { ApiErrorResponse } from '../types/index.js';

/**
 * Middleware that validates the data root is configured and accessible.
 * Should be applied to routes that require a valid data root.
 */
export async function validateRootMiddleware(
  req: Request,
  res: Response<ApiErrorResponse>,
  next: NextFunction,
): Promise<void> {
  const dataRoot = getDataRoot();

  if (!dataRoot) {
    res.status(400).json({
      success: false,
      error: {
        code: 'DATA_ROOT_NOT_SET',
        message: 'No data root has been configured. Please set the data root first.',
      },
    });
    return;
  }

  const isValid = await validateDirectory(dataRoot);

  if (!isValid) {
    res.status(400).json({
      success: false,
      error: {
        code: 'DATA_ROOT_INVALID',
        message: `The configured data root is not accessible: ${dataRoot}`,
        details: { path: dataRoot },
      },
    });
    return;
  }

  next();
}
