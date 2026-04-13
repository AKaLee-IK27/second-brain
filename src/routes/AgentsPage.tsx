import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { Icon } from '../components/shared/Icon';

const tierColors: Record<string, string> = {
  core: 'bg-sb-accent/20 text-sb-accent border-sb-accent/30',
  specialist: 'bg-sb-warning/20 text-sb-warning border-sb-warning/30',
  utility: 'bg-sb-text-muted/20 text-sb-text-muted border-sb-text-muted/30',
};

export default function AgentsPage() {
  const [tier, setTier] = useState('');
  const { data, loading } = useApi(
    () => api.agents.list({ tier: tier || undefined }),
    [tier],
  );

  if (loading) return <LoadingSkeleton lines={8} />;

  const agents = data?.agents || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-sb-text">Agents</h1>
        <span className="text-sm text-sb-text-secondary">
          {agents.length} agents
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'core', 'specialist', 'utility'].map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`sb-btn px-3 py-1 text-sm capitalize ${
              tier === t ? 'sb-btn-accent' : ''
            }`}
          >
            {t || 'All'}
          </button>
        ))}
      </div>

      {agents.length === 0 ? (
        <EmptyState
          title="No agents found"
          description="Agent definitions will appear here once added to your data root."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Link
              key={agent.slug}
              to={`/agents/${agent.slug}`}
              className="sb-card p-5 hover:border-sb-accent/50 transition-colors block"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">
                  {agent.emoji || <Icon name="Bot" size={32} ariaHidden />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-sb-text truncate">
                      {agent.name}
                    </h3>
                    <span
                      className={`px-1.5 py-0.5 text-xs border rounded-full ${
                        tierColors[agent.tier] || tierColors.utility
                      }`}
                    >
                      {agent.tier}
                    </span>
                  </div>
                  <p className="text-xs text-sb-text-secondary mt-1">
                    {agent.model}
                  </p>
                  {agent.shortDescription && (
                    <p className="text-xs text-sb-text-muted mt-2 line-clamp-2">
                      {agent.shortDescription}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
