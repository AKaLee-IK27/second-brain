import { useState, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { SessionCard } from '../components/sessions/SessionCard';
import { SessionFilters } from '../components/sessions/SessionFilters';
import { EmptyState } from '../components/shared/EmptyState';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { MaterialIcon } from '../components/shared/MaterialIcon';

export default function SessionsPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data: sessionsData, loading } = useApi(
    () => api.sessions.list({ page, limit, ...filters }),
    [page, filters]
  );

  const { data: meta } = useApi(() => api.sessions.meta(), []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  if (loading) return <LoadingSkeleton lines={10} />;

  const sessions = sessionsData?.sessions || [];
  const total = sessionsData?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Compute agent usage for right panel
  const agentUsage = meta?.agents?.map(agent => {
    const count = sessions.filter(s => s.agent === agent).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { name: agent, count, pct };
  }).sort((a, b) => b.count - a.count).slice(0, 5) || [];

  // Compute total cost and tokens
  const totalCost = sessions.reduce((sum, s) => sum + (s.cost || 0), 0);
  const totalTokens = sessions.reduce((sum, s) => sum + (s.tokens?.total || 0), 0);

  return (
    <div className="flex h-full">
      {/* Center Panel: Session List */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {/* Command Filter Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-container-low border-b border-outline-variant/15 shrink-0">
          <div className="flex items-center gap-4 text-xs font-mono">
            <SessionFilters meta={meta || null} filters={filters} onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {sessions.length === 0 ? (
            <EmptyState
              title="No sessions found"
              description={total === 0 ? "Run the migration tool to import your SQLite sessions." : "Try adjusting your filters."}
              action={total === 0 ? { label: "Run Migration", onClick: () => {} } : undefined}
            />
          ) : (
            sessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </div>

        {/* Pagination Footer */}
        {total > limit && (
          <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/15 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono text-outline-variant">
              Showing {startItem}-{endItem} of {total} sessions
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <MaterialIcon name="chevron_left" size={18} />
              </button>
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-6 h-6 flex items-center justify-center text-[10px] font-mono rounded transition-colors ${
                        page === pageNum
                          ? 'bg-primary/20 text-primary'
                          : 'text-outline-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page * limit >= total}
                className="p-1 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <MaterialIcon name="chevron_right" size={18} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Right Panel: Contextual Stats */}
      <aside className="w-80 flex flex-col bg-surface-container-lowest p-6 gap-8 overflow-y-auto border-l border-outline-variant/15">
        {/* Knowledge Overview */}
        <div className="space-y-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-outline font-mono">Knowledge Overview</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/10">
              <p className="text-[10px] text-outline-variant font-mono mb-1">Total Cost</p>
              <p className="text-lg font-bold text-on-surface">${totalCost.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/10">
              <p className="text-[10px] text-outline-variant font-mono mb-1">Context</p>
              <p className="text-lg font-bold text-primary">{(totalTokens / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>

        {/* Agent Usage */}
        {agentUsage.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-outline font-mono">Agent Usage</h4>
              <span className="text-[10px] text-primary font-mono cursor-pointer hover:underline">View All</span>
            </div>
            <div className="space-y-3">
              {agentUsage.map((agent, i) => {
                const colors = ['bg-primary-container', 'bg-secondary', 'bg-tertiary', 'bg-primary/60', 'bg-primary/40'];
                return (
                  <div key={agent.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-on-surface">{agent.name}</span>
                      <span className="text-outline-variant">{agent.pct}%</span>
                    </div>
                    <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${agent.pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
