import fs from 'fs';
import path from 'path';
import type {
  FileDiff,
  FileDiffStatus,
  VaultDiff,
  SyncPreview,
  SyncResult,
  Vault,
} from '../types/index.js';
import { hashFile, getFileSize } from './file-hasher.js';
import { getDataRoot, getVaults } from '../config.js';

// Config type subdirectories to scan under the data root
const CONFIG_TYPES = ['agents', 'skills', 'themes', 'environments'] as const;

/**
 * Discover all config files from the source data root.
 * Returns array of { relativePath, absolutePath } for each file.
 */
function discoverSourceFiles(): { relativePath: string; absolutePath: string }[] {
  const dataRoot = getDataRoot();
  if (!dataRoot) return [];

  const files: { relativePath: string; absolutePath: string }[] = [];

  // Check for root-level opencode.jsonc
  const opencodePath = path.join(dataRoot, 'opencode.jsonc');
  if (fs.existsSync(opencodePath)) {
    files.push({ relativePath: 'opencode.jsonc', absolutePath: opencodePath });
  }

  // Check each config type subdirectory
  for (const type of CONFIG_TYPES) {
    const typeDir = path.join(dataRoot, type);
    if (!fs.existsSync(typeDir)) continue;

    try {
      const entries = fs.readdirSync(typeDir);
      for (const entry of entries) {
        if (entry.endsWith('.md') || entry.endsWith('.jsonc') || entry.endsWith('.json')) {
          files.push({
            relativePath: `${type}/${entry}`,
            absolutePath: path.join(typeDir, entry),
          });
        }
      }
    } catch { /* skip unreadable dirs */ }
  }

  return files;
}

/**
 * Compute diff between source files and a single vault.
 */
function computeVaultDiff(
  vault: Vault,
  sourceFiles: { relativePath: string; absolutePath: string }[],
): VaultDiff {
  const files: FileDiff[] = [];
  const sourceRelativePaths = new Set(sourceFiles.map((s) => s.relativePath));

  for (const source of sourceFiles) {
    const targetPath = path.join(vault.path, source.relativePath);
    const sourceHash = hashFile(source.absolutePath);
    const targetHash = hashFile(targetPath);
    const sourceSize = getFileSize(source.absolutePath);
    const targetSize = getFileSize(targetPath);

    let status: FileDiffStatus;
    if (!targetHash) {
      status = 'new';
    } else if (sourceHash !== targetHash) {
      status = 'modified';
    } else {
      status = 'unchanged';
    }

    files.push({
      sourcePath: source.absolutePath,
      targetPath,
      status,
      sourceHash: sourceHash || undefined,
      targetHash: targetHash || undefined,
      sourceSize: sourceSize || undefined,
      targetSize: targetSize || undefined,
    });
  }

  // Check for files in vault that no longer exist in source
  for (const type of ['.', ...CONFIG_TYPES] as const) {
    const dirPath = type === '.' ? vault.path : path.join(vault.path, type);
    if (!fs.existsSync(dirPath)) continue;

    try {
      const entries = fs.readdirSync(dirPath);
      for (const entry of entries) {
        // Skip backup and temp files
        if (entry.endsWith('.tmp') || entry.endsWith('.bak')) continue;

        const relativePath = type === '.' ? entry : `${type}/${entry}`;
        if (!sourceRelativePaths.has(relativePath)) {
          files.push({
            sourcePath: '',
            targetPath: path.join(dirPath, entry),
            status: 'deleted',
          });
        }
      }
    } catch { /* skip */ }
  }

  const summary = {
    new: files.filter((f) => f.status === 'new').length,
    modified: files.filter((f) => f.status === 'modified').length,
    unchanged: files.filter((f) => f.status === 'unchanged').length,
    deleted: files.filter((f) => f.status === 'deleted').length,
    totalChanges: files.filter((f) => f.status !== 'unchanged').length,
  };

  return {
    vaultId: vault.id,
    vaultName: vault.name,
    vaultPath: vault.path,
    files,
    summary,
  };
}

/**
 * Generate a full sync preview for all vaults.
 */
export function generateSyncPreview(): SyncPreview {
  const sourceFiles = discoverSourceFiles();
  const vaults = getVaults();

  const vaultDiffs = vaults.map((vault) => computeVaultDiff(vault, sourceFiles));

  return {
    sourceRoot: getDataRoot() || '',
    vaults: vaultDiffs,
    totalFiles: sourceFiles.length,
    totalChanges: vaultDiffs.reduce((sum, v) => sum + v.summary.totalChanges, 0),
  };
}

/**
 * Atomically write content to a file.
 * Writes to .tmp first, then renames for atomicity.
 */
function atomicWrite(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, content, 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

/**
 * Execute sync to all vaults.
 * For each vault, copies all source files atomically.
 * Backs up existing files as .bak before overwriting.
 */
export function executeSync(): SyncResult {
  const sourceFiles = discoverSourceFiles();
  const vaults = getVaults();
  const result: SyncResult = { success: 0, failed: 0, errors: [] };

  for (const vault of vaults) {
    try {
      for (const source of sourceFiles) {
        const content = fs.readFileSync(source.absolutePath, 'utf-8');
        const targetPath = path.join(vault.path, source.relativePath);

        // Backup existing file
        if (fs.existsSync(targetPath)) {
          const bakPath = `${targetPath}.bak`;
          try {
            fs.copyFileSync(targetPath, bakPath);
          } catch {
            // Skip backup if it fails — don't block the sync
          }
        }

        atomicWrite(targetPath, content);
      }
      result.success++;
    } catch (err) {
      result.failed++;
      result.errors.push({
        vaultId: vault.id,
        vaultName: vault.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}
