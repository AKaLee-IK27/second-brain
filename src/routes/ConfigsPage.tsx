import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import VaultManager from '../components/vaults/VaultManager';
import SyncPreviewModal from '../components/vaults/SyncPreviewModal';
import type { Vault } from '../types/vault';
import { MaterialIcon } from '../components/shared/MaterialIcon';

const typeColors: Record<string, string> = {
  opencode: 'bg-primary/15 text-primary border-primary/20',
  skill: 'bg-secondary/15 text-secondary border-secondary/20',
  agent: 'bg-tertiary/15 text-tertiary border-tertiary/20',
  theme: 'bg-outline-variant/15 text-on-surface-variant border-outline-variant/20',
  environment: 'bg-primary/10 text-primary border-primary/15',
};

const scopeColors: Record<string, string> = {
  global: 'bg-outline-variant/15 text-on-surface-variant border-outline-variant/20',
  project: 'bg-primary/15 text-primary border-primary/20',
  user: 'bg-secondary/15 text-secondary border-secondary/20',
};

export default function ConfigsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const { data, loading } = useApi(() => api.configs.list(), []);

  useEffect(() => {
    api.vaults.list().then((res) => setVaults(res.vaults)).catch(() => {});
  }, []);

  const handleVaultsChange = () => {
    api.vaults.list().then((res) => setVaults(res.vaults)).catch(() => {});
  };

  if (loading) return <LoadingSkeleton lines={8} />;

  const configs = data?.configs || [];
  const types = [...new Set(configs.map((c) => c.type))];

  const filtered = typeFilter
    ? configs.filter((c) => c.type === typeFilter)
    : configs;

  return (
    <div className="flex h-full">
      {/* Left Panel: Type Rail */}
      <aside className="w-64 bg-surface-container-low p-6 flex flex-col gap-8 overflow-y-auto">
        <div>
          <h2 className="font-headline font-bold text-lg mb-4 text-on-surface">Configurations</h2>
          <p className="font-serif text-sm text-on-surface-variant leading-relaxed">
            System configurations filtered by operational scope.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-tighter text-outline-variant mb-2">Types</span>
          <button
            onClick={() => setTypeFilter('')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === ''
                ? 'bg-surface-container-highest text-on-surface'
                : 'text-on-surface-variant hover:bg-surface-container/50'
            }`}
          >
            <span>All Types</span>
            <span className="bg-surface-container-low px-1.5 rounded text-[10px] font-mono">{configs.length}</span>
          </button>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                typeFilter === t
                  ? 'bg-surface-container-highest text-on-surface'
                  : 'text-on-surface-variant hover:bg-surface-container/50'
              }`}
            >
              <span>{t}</span>
              <span className="text-[10px] font-mono opacity-50">{configs.filter(c => c.type === t).length}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Center Panel: Config List */}
      <section className="flex-1 bg-background p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-primary" />
            <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Config Files</h1>
          </div>
          <button
            onClick={() => setShowSyncModal(true)}
            disabled={vaults.length === 0}
            className="sb-btn-primary px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <MaterialIcon name="cloud_sync" size={16} />
            Preview Sync
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No configs found"
            description="Configuration files will appear here once detected in your data root."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((config) => (
              <Link
                key={config.slug}
                to={`/configs/${config.slug}`}
                className="group flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high transition-all duration-150 rounded-lg border border-transparent hover:border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface font-headline">{config.name}</h3>
                    <p className="text-xs text-on-surface-variant font-mono mt-0.5">{config.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs border rounded-full capitalize ${typeColors[config.type] || typeColors.opencode}`}>
                    {config.type}
                  </span>
                  <span className={`px-2 py-0.5 text-xs border rounded-full capitalize ${scopeColors[config.scope] || scopeColors.global}`}>
                    {config.scope}
                  </span>
                  <span className="text-xs text-outline-variant font-mono">
                    {new Date(config.lastSynced).toLocaleDateString()}
                  </span>
                  <MaterialIcon name="chevron_right" size={18} className="text-outline-variant group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Vaults section */}
        <div className="border-t border-outline-variant/10 mt-12 pt-6">
          <VaultManager vaults={vaults} onVaultsChange={handleVaultsChange} />
        </div>
      </section>

      {/* Sync modal */}
      <SyncPreviewModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onSyncComplete={handleVaultsChange}
      />
    </div>
  );
}
