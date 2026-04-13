import { Router } from 'express';
import { getDataRoot, setDataRoot } from '../config.js';
import { validateDirectory, listFiles } from '../services/file-reader.js';
import type {
  DataRootResponse,
  ValidateRootRequest,
  ValidateRootResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../types/index.js';

const router = Router();

/**
 * GET /api/config/data-root
 * Returns the currently configured data root path.
 */
router.get('/data-root', (_req, res) => {
  const dataRoot = getDataRoot();
  const response: ApiSuccessResponse<DataRootResponse> = {
    success: true,
    data: { path: dataRoot },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
});

/**
 * POST /api/config/data-root
 * Sets the data root path. Validates that the path exists and is a directory.
 */
router.post('/data-root', async (req, res) => {
  const { path: requestedPath } = req.body as { path?: string };

  if (!requestedPath || typeof requestedPath !== 'string') {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'DATA_ROOT_INVALID',
        message: 'A valid path string is required in the request body',
        details: { received: requestedPath },
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  const isValid = await validateDirectory(requestedPath);

  if (!isValid) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'DATA_ROOT_INVALID',
        message: `The specified path is not a valid directory: ${requestedPath}`,
        details: { path: requestedPath },
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  setDataRoot(requestedPath);

  const response: ApiSuccessResponse<{ path: string }> = {
    success: true,
    data: { path: getDataRoot()! },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
});

/**
 * POST /api/config/validate-root
 * Validates a path without setting it as the data root.
 * Returns whether the path is valid and what content types it contains.
 */
router.post('/validate-root', async (req, res) => {
  const { path: requestedPath } = req.body as ValidateRootRequest;

  if (!requestedPath || typeof requestedPath !== 'string') {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'DATA_ROOT_INVALID',
        message: 'A valid path string is required in the request body',
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  const isValid = await validateDirectory(requestedPath);

  if (!isValid) {
    const response: ApiSuccessResponse<ValidateRootResponse> = {
      success: true,
      data: {
        valid: false,
        contentTypes: [],
        error: `Path is not a valid directory: ${requestedPath}`,
      },
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
    return;
  }

  // Check which content type directories exist
  const contentTypes: string[] = [];
  const knownTypes = ['sessions', 'agents', 'skills', 'topics', 'configs'];

  for (const type of knownTypes) {
    try {
      const typePath = `${requestedPath}/${type}`;
      const typeValid = await validateDirectory(typePath);
      if (typeValid) {
        // Check if there are any .md files in this directory
        const files = await listFiles(typePath, '.md');
        if (files.length > 0) {
          contentTypes.push(type);
        }
      }
    } catch {
      // Directory doesn't exist or isn't readable — skip
    }
  }

  const response: ApiSuccessResponse<ValidateRootResponse> = {
    success: true,
    data: {
      valid: contentTypes.length > 0,
      contentTypes,
    },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
});

export default router;
