import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import type {
  VaultsListResponse,
  AddVaultRequest,
  AddVaultResponse,
  SyncPreviewResponse,
  SyncResultResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  Vault,
} from '../types/index.js';
import { getVaults, addVault, removeVault, getDataRoot } from '../config.js';
import { generateSyncPreview, executeSync } from '../services/sync-engine.js';

const router = Router();

/**
 * GET /api/vaults
 * List all registered vaults for the current data root.
 */
router.get('/', (_req, res) => {
  const vaults = getVaults();
  const response: ApiSuccessResponse<VaultsListResponse> = {
    success: true,
    data: { vaults },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
});

/**
 * POST /api/vaults
 * Add a new vault. Validates that the path exists and is writable.
 */
router.post('/', (req, res) => {
  const { path: vaultPath } = req.body as AddVaultRequest;

  if (!vaultPath || typeof vaultPath !== 'string') {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'VAULT_PATH_INVALID',
        message: 'A valid path string is required',
        details: { received: vaultPath },
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  const resolvedPath = path.resolve(vaultPath);

  // Validate: directory exists or parent directory exists (we can create it)
  if (!fs.existsSync(resolvedPath)) {
    const parentDir = path.dirname(resolvedPath);
    if (!fs.existsSync(parentDir)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VAULT_PATH_INVALID',
          message: `Parent directory does not exist: ${parentDir}`,
          details: { path: vaultPath },
        },
      };
      res.status(400).json(errorResponse);
      return;
    }
  }

  // Test writability — create the dir if it doesn't exist
  try {
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(resolvedPath, { recursive: true });
    }
    fs.accessSync(resolvedPath, fs.constants.W_OK);
  } catch {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'VAULT_NOT_WRITABLE',
        message: `Path is not writable: ${resolvedPath}`,
        details: { path: vaultPath },
      },
    };
    res.status(403).json(errorResponse);
    return;
  }

  const vault: Vault = {
    id: `vault-${Date.now()}`,
    path: resolvedPath,
    name: path.basename(resolvedPath),
    addedAt: new Date().toISOString(),
  };

  addVault(vault);

  const response: ApiSuccessResponse<AddVaultResponse> = {
    success: true,
    data: { vault },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
});

/**
 * DELETE /api/vaults/:id
 * Remove a vault by ID.
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const removed = removeVault(id);

  if (!removed) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'VAULT_NOT_FOUND',
        message: `Vault not found: ${id}`,
      },
    };
    res.status(404).json(errorResponse);
    return;
  }

  const response: ApiSuccessResponse<{ success: true }> = {
    success: true,
    data: { success: true },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
});

/**
 * POST /api/vaults/preview
 * Compute sync diff preview without writing anything.
 */
router.post('/preview', (_req, res) => {
  const dataRoot = getDataRoot();
  if (!dataRoot) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'DATA_ROOT_NOT_SET',
        message: 'Data root is not configured',
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  const preview = generateSyncPreview();
  const response: ApiSuccessResponse<SyncPreviewResponse> = {
    success: true,
    data: { preview },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
});

/**
 * POST /api/vaults/sync
 * Execute sync to all vaults.
 */
router.post('/sync', (_req, res) => {
  const dataRoot = getDataRoot();
  if (!dataRoot) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'DATA_ROOT_NOT_SET',
        message: 'Data root is not configured',
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  const result = executeSync();
  const response: ApiSuccessResponse<SyncResultResponse> = {
    success: true,
    data: { result },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
});

export default router;
