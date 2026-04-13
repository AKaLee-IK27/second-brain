import type { StatsSummary } from '../types/stats';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');

  const { data: summary, loading: sLoading } = useApi(
    () => api.stats.summary(),
    [],
  );
  const { data: timeline, loading: tLoading } = useApi(
    () => api.stats.timeline({ range: timeRange }),
    [timeRange],
  );
  const { data: byAgent, loading: aLoading } = useApi(
    () => api.stats.byAgent(),
    [],
  );

  if (sLoading || tLoading || aLoading) return <LoadingSkeleton lines={10} />;

  const s: StatsSummary = summary || ({} as StatsSummary);
  const agents = byAgent?.agents || [];
  const timelineData = timeline?.data || [];

  const maxSessions = Math.max(...agents.map((a) => a.sessions), 1);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-sb-text">Stats Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sb-card p-5">
          <div className="text-2xl font-bold text-sb-text">
            {s.totalSessions || 0}
          </div>
          <div className="text-sm text-sb-text-secondary">Total Sessions</div>
        </div>
        <div className="sb-card p-5">
          <div className="text-2xl font-bold text-sb-text">
            {(s.totalTokens?.total || 0).toLocaleString()}
          </div>
          <div className="text-sm text-sb-text-secondary">Total Tokens</div>
        </div>
        <div className="sb-card p-5">
          <div className="text-2xl font-bold text-sb-text">
            ${(s.totalCost || 0).toFixed(4)}
          </div>
          <div className="text-sm text-sb-text-secondary">Total Cost</div>
        </div>
        <div className="sb-card p-5">
          <div className="text-2xl font-bold text-sb-text">
            ${(s.avgCostPerSession || 0).toFixed(4)}
          </div>
          <div className="text-sm text-sb-text-secondary">Avg Cost/Session</div>
        </div>
      </div>

      {/* Content Counts */}
      <div className="sb-card p-6">
        <h2 className="text-sm font-semibold text-sb-text mb-4">
          Content Types
        </h2>
        <div className="grid grid-cols-5 gap-4 text-center">
          {Object.entries(s.contentCounts || {}).map(([key, count]) => (
            <div key={key}>
              <div className="text-xl font-bold text-sb-text">
                {count as number}
              </div>
              <div className="text-xs text-sb-text-secondary capitalize">
                {key}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Breakdown */}
      <div className="sb-card p-6">
        <h2 className="text-sm font-semibold text-sb-text mb-4">
          Sessions by Agent
        </h2>
        <div className="space-y-3">
          {agents.slice(0, 10).map((agent) => (
            <div key={agent.agent} className="flex items-center gap-3">
              <span className="text-sm text-sb-text w-24 truncate">
                {agent.agent}
              </span>
              <div className="flex-1 h-6 bg-sb-surface-alt rounded-full overflow-hidden">
                <div
                  className="h-full bg-sb-accent rounded-full transition-all"
                  style={{
                    width: `${(agent.sessions / maxSessions) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm text-sb-text-secondary w-16 text-right">
                {agent.sessions}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="sb-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-sb-text">
            Sessions Over Time
          </h2>
          <div className="flex gap-1">
            {(['7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`sb-btn px-2 py-0.5 text-xs capitalize ${timeRange === r ? 'sb-btn-accent' : ''}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-1 h-32">
          {timelineData.slice(-30).map((d, i) => {
            const maxS = Math.max(
              ...timelineData.slice(-30).map((x) => x.sessions),
              1,
            );
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-sb-accent/60 rounded-t transition-all hover:bg-sb-accent"
                  style={{
                    height: `${(d.sessions / maxS) * 100}%`,
                    minHeight: d.sessions > 0 ? '4px' : '0',
                  }}
                  title={`${d.date}: ${d.sessions} sessions`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-sb-text-muted">
          <span>{timelineData[0]?.date || ''}</span>
          <span>{timelineData[timelineData.length - 1]?.date || ''}</span>
        </div>
      </div>
    </div>
  );
}
