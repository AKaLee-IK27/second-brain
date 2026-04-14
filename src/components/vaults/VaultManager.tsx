import { useState } from 'react';
import { api } from '../../services/api';
import type { Vault } from '../../types/vault';

interface VaultManagerProps {
  vaults: Vault[];
  onVaultsChange: () => void;
}

export default function VaultManager({ vaults, onVaultsChange }: VaultManagerProps) {
  const [newPath, setNewPath] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newPath.trim()) return;
    setError('');
    setAdding(true);

    try {
      await api.vaults.add(newPath.trim());
      setNewPath('');
      onVaultsChange();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add vault');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.vaults.remove(id);
      onVaultsChange();
    } catch {
      setError('Failed to remove vault');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-sb-text">
        Managed Vaults ({vaults.length})
      </h2>

      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded px-3 py-2">
          {error}
        </div>
      )}

      {vaults.length > 0 && (
        <div className="space-y-2">
          {vaults.map((vault) => (
            <div
              key={vault.id}
              className="sb-card p-3 flex items-center justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-sb-text">
                  {vault.name}
                </div>
                <div className="text-xs text-sb-text-secondary mt-0.5 truncate">
                  {vault.path}
                </div>
                <div className="text-xs text-sb-text-muted mt-0.5">
                  Added {new Date(vault.addedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleRemove(vault.id)}
                className="text-sb-text-muted hover:text-red-400 transition-colors px-2 py-1 text-sm flex-shrink-0"
                title="Remove vault"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="/path/to/project/.opencode"
          className="flex-1 bg-sb-bg-secondary border border-sb-border rounded px-3 py-2 text-sm text-sb-text placeholder-sb-text-muted focus:outline-none focus:border-sb-accent/50"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newPath.trim()}
          className="sb-btn sb-btn-accent px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? 'Adding...' : '+ Add Vault'}
        </button>
      </div>
    </div>
  );
}
