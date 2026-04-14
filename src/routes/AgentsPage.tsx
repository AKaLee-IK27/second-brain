import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { MaterialIcon } from '../components/shared/MaterialIcon';
import { SmartIcon } from '../components/shared/AgentIcons';

const tierColors: Record<string, string> = {
  core: 'bg-secondary/15 text-secondary border-secondary/20',
  specialist: 'bg-primary/15 text-primary border-primary/20',
  utility: 'bg-tertiary/15 text-tertiary border-tertiary/20',
  archival: 'bg-outline-variant/15 text-on-surface-variant border-outline-variant/20',
};

const tierOrder = ['core', 'specialist', 'utility', 'archival'];

export default function AgentsPage() {
  const [category, setCategory] = useState('');
  const { data, loading } = useApi(
    () => api.agents.list({ tier: category || undefined }),
    [category],
  );

  const { data: allData } = useApi(() => api.agents.list(), []);
  const allAgents = allData?.agents || [];

  if (loading) return <LoadingSkeleton lines={8} />;

  const agents = data?.agents || [];

  // Count by category
  const categoryCounts = tierOrder.reduce((acc, tier) => {
    acc[tier] = allAgents.filter(a => a.tier === tier).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex h-full">
      {/* Left Panel: Category Rail */}
      <aside className="w-64 bg-surface-container-low p-6 flex flex-col gap-8 overflow-y-auto">
        <div>
          <h2 className="font-headline font-bold text-lg mb-4 text-on-surface">Registry</h2>
          <p className="font-serif text-sm text-on-surface-variant leading-relaxed">
            System-wide autonomous units filtered by operational intent.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-tighter text-outline-variant mb-2">Categories</span>
          <button
            onClick={() => setCategory('')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === ''
                ? 'bg-surface-container-highest text-on-surface'
                : 'text-on-surface-variant hover:bg-surface-container/50'
            }`}
          >
            <span>All Units</span>
            <span className="bg-surface-container-low px-1.5 rounded text-[10px] font-mono">{allAgents.length}</span>
          </button>
          {tierOrder.map(tier => (
            <button
              key={tier}
              onClick={() => setCategory(tier)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                category === tier
                  ? 'bg-surface-container-highest text-on-surface'
                  : 'text-on-surface-variant hover:bg-surface-container/50'
              }`}
            >
              <span>{tier}</span>
              <span className="text-[10px] font-mono opacity-50">{categoryCounts[tier] || 0}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Center Panel: Agent Grid */}
      <section className="flex-1 bg-background p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-primary" />
            <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Active Agents</h1>
          </div>
        </div>

        {agents.length === 0 ? (
          <EmptyState
            title="No agents found"
            description="Agent definitions will appear here once added to your data root."
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Link
                key={agent.slug}
                to={`/agents/${agent.slug}`}
                className="group bg-surface-container-low rounded-[10px] p-6 transition-all duration-150 relative overflow-hidden border border-transparent hover:border-primary/20"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="text-primary">
                    <SmartIcon emoji={agent.emoji} size={32} className="w-8 h-8" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-headline font-bold tracking-widest border ${tierColors[agent.tier] || tierColors.utility}`}>
                    {agent.tier?.toUpperCase() || 'UTILITY'}
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-1">{agent.name}</h3>
                <div className="font-mono text-[11px] text-primary mb-4">MODEL: {agent.model?.toUpperCase() || 'UNKNOWN'}</div>
                {agent.shortDescription && (
                  <p className="font-serif text-sm text-on-surface-variant leading-relaxed mb-6">
                    {agent.shortDescription}
                  </p>
                )}
                <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/10">
                  <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1 group-hover:text-primary transition-colors">
                    <MaterialIcon name="settings" size={14} /> CONFIGURE
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1 group-hover:text-primary transition-colors">
                    <MaterialIcon name="play_arrow" size={14} /> DEPLOY
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
