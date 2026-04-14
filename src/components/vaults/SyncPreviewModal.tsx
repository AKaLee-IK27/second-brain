import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { SyncPreview, SyncResult, VaultDiff } from '../../types/vault';

interface SyncPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

const statusIcons: Record<string, string> = {
  new: '✚',
  modified: '✎',
  unchanged: '✓',
  deleted: '✕',
};

const statusColors: Record<string, string> = {
  new: 'text-sb-success',
  modified: 'text-sb-warning',
  unchanged: 'text-sb-text-muted',
  deleted: 'text-red-400',
};

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function VaultDiffSection({ vaultDiff }: { vaultDiff: VaultDiff }) {
  const [expanded, setExpanded] = useState(false);
  const changedFiles = vaultDiff.files.filter((f) => f.status !== 'unchanged');

  return (
    <div className="border border-sb-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-sb-bg-secondary hover:bg-sb-bg-tertiary transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-sb-text">
            {expanded ? '▼' : '▶'} {vaultDiff.vaultName}
          </span>
          <span className="text-xs text-sb-text-secondary">
            {vaultDiff.summary.totalChanges} changes
          </span>
        </div>
        <div className="flex gap-3 text-xs">
          {vaultDiff.summary.new > 0 && (
            <span className="text-sb-success">{vaultDiff.summary.new} new</span>
          )}
          {vaultDiff.summary.modified > 0 && (
            <span className="text-sb-warning">
              {vaultDiff.summary.modified} modified
            </span>
          )}
          {vaultDiff.summary.deleted > 0 && (
            <span className="text-red-400">
              {vaultDiff.summary.deleted} deleted
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-sb-border">
          {changedFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`${statusColors[file.status]} font-mono text-xs`}
                >
                  {statusIcons[file.status]}
                </span>
                <span className="text-sb-text-secondary">
                  {file.targetPath.split('/').slice(-2).join('/')}
                </span>
              </div>
              <span className="text-xs text-sb-text-muted">
                {formatSize(file.sourceSize)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SyncPreviewModal({
  isOpen,
  onClose,
  onSyncComplete,
}: SyncPreviewModalProps) {
  const [preview, setPreview] = useState<SyncPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && !preview && !result) {
      loadPreview();
    }
  }, [isOpen]);

  const loadPreview = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.vaults.preview();
      setPreview(data.preview);
    } catch {
      setError('Failed to load sync preview');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    try {
      const data = await api.vaults.sync();
      setResult(data.result);
      onSyncComplete();
    } catch {
      setError('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setResult(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const vaultsWithChanges =
    preview?.vaults.filter((v) => v.summary.totalChanges > 0) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-sb-bg-primary border border-sb-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sb-border">
          <h2 className="text-lg font-semibold text-sb-text">
            {result ? 'Sync Complete' : 'Sync Preview'}
          </h2>
          <button
            onClick={handleClose}
            className="text-sb-text-muted hover:text-sb-text transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-8 text-sb-text-muted">
              Computing diff...
            </div>
          )}

          {preview && !result && (
            <>
              <div className="text-sm text-sb-text-secondary">
                Source: {preview.sourceRoot}
              </div>
              <div className="text-sm text-sb-text-secondary">
                Total changes:{' '}
                <span className="text-sb-accent font-medium">
                  {preview.totalChanges}
                </span>{' '}
                files across {vaultsWithChanges.length} vaults
              </div>

              {vaultsWithChanges.length === 0 ? (
                <div className="text-center py-8 text-sb-text-muted">
                  All vaults are up to date
                </div>
              ) : (
                <div className="space-y-3">
                  {vaultsWithChanges.map((vaultDiff) => (
                    <VaultDiffSection
                      key={vaultDiff.vaultId}
                      vaultDiff={vaultDiff}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {result && (
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-sb-success">
                  ✓ {result.success} vault{result.success !== 1 ? 's' : ''} synced
                </span>
                {result.failed > 0 && (
                  <span className="text-red-400 ml-3">
                    ✕ {result.failed} failed
                  </span>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="space-y-1">
                  {result.errors.map((err, i) => (
                    <div
                      key={i}
                      className="text-xs text-red-400 bg-red-400/10 rounded px-3 py-2"
                    >
                      <strong>{err.vaultName}:</strong> {err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-sb-border">
            <button
              onClick={handleClose}
              className="sb-btn px-4 py-2 text-sm"
            >
              {result ? 'Close' : 'Cancel'}
            </button>
            {preview && !result && vaultsWithChanges.length > 0 && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="sb-btn sb-btn-accent px-4 py-2 text-sm disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : 'Confirm Sync'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
