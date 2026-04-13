import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';

const typeColors: Record<string, string> = {
  opencode: 'bg-sb-accent/20 text-sb-accent border-sb-accent/30',
  skill: 'bg-sb-warning/20 text-sb-warning border-sb-warning/30',
  agent: 'bg-sb-success/20 text-sb-success border-sb-success/30',
  theme: 'bg-sb-text-muted/20 text-sb-text-muted border-sb-text-muted/30',
  environment:
    'bg-sb-accent/10 text-sb-accent border-sb-accent/20',
};

const scopeColors: Record<string, string> = {
  global: 'bg-sb-text-muted/20 text-sb-text-muted border-sb-text-muted/30',
  project: 'bg-sb-accent/20 text-sb-accent border-sb-accent/30',
  user: 'bg-sb-warning/20 text-sb-warning border-sb-warning/30',
};

export default function ConfigsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const { data, loading } = useApi(() => api.configs.list(), []);

  if (loading) return <LoadingSkeleton lines={8} />;

  const configs = data?.configs || [];
  const types = [...new Set(configs.map((c) => c.type))];

  const filtered = typeFilter
    ? configs.filter((c) => c.type === typeFilter)
    : configs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-sb-text">Configs</h1>
        <span className="text-sm text-sb-text-secondary">
          {configs.length} configs
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTypeFilter('')}
          className={`sb-btn px-3 py-1 text-sm ${
            !typeFilter ? 'sb-btn-accent' : ''
          }`}
        >
          All
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`sb-btn px-3 py-1 text-sm capitalize ${
              typeFilter === t ? 'sb-btn-accent' : ''
            }`}
          >
            {t}
          </button>
        ))}
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
              className="sb-card p-4 hover:border-sb-accent/50 transition-colors block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-sb-text">
                      {config.name}
                    </h3>
                    <p className="text-xs text-sb-text-secondary mt-0.5">
                      {config.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs border rounded-full capitalize ${
                      typeColors[config.type] || typeColors.opencode
                    }`}
                  >
                    {config.type}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs border rounded-full capitalize ${
                      scopeColors[config.scope] || scopeColors.global
                    }`}
                  >
                    {config.scope}
                  </span>
                  <span className="text-xs text-sb-text-muted">
                    {new Date(config.lastSynced).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
