import fs from 'fs/promises';
import path from 'path';
import { getDataRoot } from '../config.js';
import { ErrorCode } from '../types/index.js';

/**
 * Custom error class for file system operations.
 * Carries an error code that maps to HTTP status codes.
 */
export class FileError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'FileError';
  }
}

/**
 * Validates that a given path is within the configured data root.
 * Throws PATH_TRAVERSAL if the resolved path escapes the data root.
 * Throws DATA_ROOT_NOT_SET if no data root is configured.
 */
function validatePathWithinRoot(filePath: string): string {
  const dataRoot = getDataRoot();

  if (!dataRoot) {
    throw new FileError('DATA_ROOT_NOT_SET', 'No data root has been configured');
  }

  // Resolve the full absolute path
  const resolvedPath = path.resolve(dataRoot, filePath);

  // Ensure the resolved path starts with the data root
  // Add path separator to prevent prefix matching (e.g., /data vs /data-other)
  const normalizedRoot = dataRoot.endsWith(path.sep) ? dataRoot : dataRoot + path.sep;
  const normalizedPath = resolvedPath.endsWith(path.sep) ? resolvedPath : resolvedPath + path.sep;

  if (
    !resolvedPath.startsWith(normalizedRoot) &&
    resolvedPath !== dataRoot
  ) {
    throw new FileError(
      'PATH_TRAVERSAL',
      `Access denied: path is outside the data root`,
      { requested: filePath, resolved: resolvedPath },
    );
  }

  return resolvedPath;
}

/**
 * Reads a file from the filesystem, validating that it is within the data root.
 */
export async function readFile(filePath: string): Promise<string> {
  const resolvedPath = validatePathWithinRoot(filePath);

  try {
    const content = await fs.readFile(resolvedPath, 'utf-8');
    return content;
  } catch (err) {
    if (err instanceof FileError) throw err;

    const error = err as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') {
      throw new FileError(
        'FILE_NOT_FOUND',
        `File not found: ${filePath}`,
        { path: filePath },
      );
    }

    throw new FileError(
      'INTERNAL_ERROR',
      `Failed to read file: ${error.message}`,
      { path: filePath },
    );
  }
}

/**
 * Lists files recursively within a directory, filtered by extension.
 * Returns relative paths from the data root.
 */
export async function listFiles(
  directory: string,
  extension?: string,
): Promise<string[]> {
  const resolvedDir = validatePathWithinRoot(directory);
  const dataRoot = getDataRoot()!;
  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    let entries: fs.Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        if (!extension || entry.name.endsWith(extension)) {
          const relativePath = path.relative(dataRoot, fullPath);
          results.push(relativePath);
        }
      }
    }
  }

  await walk(resolvedDir);
  return results.sort();
}

/**
 * Checks if a file exists within the data root.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const resolvedPath = validatePathWithinRoot(filePath);
    await fs.stat(resolvedPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that a directory exists and is readable.
 */
export async function validateDirectory(dirPath: string): Promise<boolean> {
  try {
    const resolvedPath = path.resolve(dirPath);
    const stat = await fs.stat(resolvedPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
