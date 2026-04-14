// Vault types — mirrors server/types/index.ts

export interface Vault {
  id: string;
  path: string;
  name: string;
  addedAt: string;
}

export type FileDiffStatus = 'new' | 'modified' | 'unchanged' | 'deleted';

export interface FileDiff {
  sourcePath: string;
  targetPath: string;
  status: FileDiffStatus;
  sourceHash?: string;
  targetHash?: string;
  sourceSize?: number;
  targetSize?: number;
}

export interface VaultDiff {
  vaultId: string;
  vaultName: string;
  vaultPath: string;
  files: FileDiff[];
  summary: {
    new: number;
    modified: number;
    unchanged: number;
    deleted: number;
    totalChanges: number;
  };
}

export interface SyncPreview {
  sourceRoot: string;
  vaults: VaultDiff[];
  totalFiles: number;
  totalChanges: number;
}

export interface SyncResult {
  success: number;
  failed: number;
  errors: { vaultId: string; vaultName: string; error: string }[];
}
