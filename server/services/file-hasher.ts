import fs from 'fs';
import crypto from 'crypto';

/**
 * Compute SHA-256 hash of a string.
 */
export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Compute SHA-256 hash of a file's content.
 * Returns null if the file doesn't exist or can't be read.
 */
export function hashFile(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return hashContent(content);
  } catch {
    return null;
  }
}

/**
 * Get file size in bytes.
 * Returns null if the file doesn't exist or can't be stat'd.
 */
export function getFileSize(filePath: string): number | null {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return null;
  }
}
