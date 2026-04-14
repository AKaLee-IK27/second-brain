import type { StatsSummary } from '../types/stats';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

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
  const maxTimelineSessions = Math.max(...timelineData.map((x) => x.sessions), 1);

  return (
    <div className="p-8 min-h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold text-on-surface tracking-tight">Analytics Dashboard</h1>
            <p className="font-serif text-on-surface-variant mt-2 max-w-xl">
              Deep telemetry of session activity, token distribution, computational expenditure, and agent performance cycles.
            </p>
          </div>
          {/* Segmented Control */}
          <div className="flex bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/15">
            {(['7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-4 py-1.5 text-xs font-mono rounded-md transition-colors ${
                  timeRange === r
                    ? 'bg-surface-container-high text-primary border border-outline-variant/20 shadow-sm'
                    : 'text-on-surface hover:text-primary'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </header>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-low p-5 rounded-lg border-l-2 border-primary group hover:bg-surface-container-high transition-colors">
            <p className="font-mono text-[10px] uppercase tracking-tighter text-outline-variant">Total Sessions</p>
            <div className="flex items-end justify-between mt-2">
              <span className="font-headline text-3xl font-bold text-on-surface">{s.totalSessions || 0}</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-5 rounded-lg border-l-2 border-secondary group hover:bg-surface-container-high transition-colors">
            <p className="font-mono text-[10px] uppercase tracking-tighter text-outline-variant">Tokens Processed</p>
            <div className="flex items-end justify-between mt-2">
              <span className="font-headline text-3xl font-bold text-on-surface">{((s.totalTokens?.total || 0) / 1000000).toFixed(1)}M</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-5 rounded-lg border-l-2 border-primary-container group hover:bg-surface-container-high transition-colors">
            <p className="font-mono text-[10px] uppercase tracking-tighter text-outline-variant">Accumulated Cost</p>
            <div className="flex items-end justify-between mt-2">
              <span className="font-headline text-3xl font-bold text-on-surface">${(s.totalCost || 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-5 rounded-lg border-l-2 border-outline-variant group hover:bg-surface-container-high transition-colors">
            <p className="font-mono text-[10px] uppercase tracking-tighter text-outline-variant">Avg Session Cost</p>
            <div className="flex items-end justify-between mt-2">
              <span className="font-headline text-3xl font-bold text-on-surface">${(s.avgCostPerSession || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Temporal Distribution Chart */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline text-sm font-semibold uppercase tracking-widest text-on-surface">Temporal Distribution</h3>
              <span className="font-mono text-[10px] text-outline">Sessions / Day</span>
            </div>
            <div className="h-64 flex items-end gap-2 px-2">
              {timelineData.slice(-20).map((d, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm relative group transition-colors ${
                    d.sessions === maxTimelineSessions
                      ? 'bg-primary-container'
                      : 'bg-surface-container-highest hover:bg-primary-container'
                  }`}
                  style={{ height: `${Math.max((d.sessions / maxTimelineSessions) * 100, 2)}%` }}
                >
                  {d.sessions > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.sessions}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2 border-t border-outline-variant/10 pt-4">
              <span className="font-mono text-[10px] text-outline">{timelineData[0]?.date || ''}</span>
              <span className="font-mono text-[10px] text-outline">{timelineData[timelineData.length - 1]?.date || ''}</span>
            </div>
          </div>

          {/* Right Rail: Resource Intensity */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant/15 flex-grow">
              <h3 className="font-headline text-sm font-semibold uppercase tracking-widest text-on-surface mb-6">Resource Intensity</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between font-mono text-[10px] mb-2">
                    <span className="text-on-surface-variant">Session Volume</span>
                    <span className="text-primary">{s.totalSessions || 0}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-mono text-[10px] mb-2">
                    <span className="text-on-surface-variant">Token Usage</span>
                    <span className="text-secondary">{((s.totalTokens?.total || 0) / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-container" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-mono text-[10px] mb-2">
                    <span className="text-on-surface-variant">Cost Efficiency</span>
                    <span className="text-tertiary">${(s.avgCostPerSession || 0).toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary-container" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Influence Ratio */}
          <div className="col-span-12 bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline text-sm font-semibold uppercase tracking-widest text-on-surface">Agent Influence Ratio</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-4">
                {agents.slice(0, 5).map((agent) => (
                  <div key={agent.agent} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[11px] text-on-surface">{agent.agent}</span>
                      <span className="font-mono text-[11px] text-outline">{agent.sessions} Sessions</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-lowest rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-sm"
                        style={{ width: `${(agent.sessions / maxSessions) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {agents.slice(5, 10).map((agent) => (
                  <div key={agent.agent} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[11px] text-on-surface">{agent.agent}</span>
                      <span className="font-mono text-[11px] text-outline">{agent.sessions} Sessions</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-lowest rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-sm"
                        style={{ width: `${(agent.sessions / maxSessions) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
