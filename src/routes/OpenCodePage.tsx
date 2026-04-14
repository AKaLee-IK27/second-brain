import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { HubSummaryCard } from '../components/opencode/HubSummaryCard';
import { RecentActivityFeed } from '../components/opencode/RecentActivityFeed';
import { MaterialIcon } from '../components/shared/MaterialIcon';

function OpenCodePage() {
  const { data: agentsData, loading: agentsLoading } = useApi(
    () => api.agents.list(),
    [],
  );
  const { data: skillsData, loading: skillsLoading } = useApi(
    () => api.skills.list(),
    [],
  );
  const { data: configsData, loading: configsLoading } = useApi(
    () => api.configs.list(),
    [],
  );

  const loading = agentsLoading || skillsLoading || configsLoading;
  const agents = agentsData?.agents || [];
  const skills = skillsData?.skills || [];
  const configs = configsData?.configs || [];

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-surface-container-high rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-surface-container-high rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MaterialIcon name="smart_toy" size={28} className="text-primary" />
              <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">OpenCode Hub</h1>
            </div>
            <p className="font-serif text-on-surface-variant mt-1 max-w-xl">
              Your AI team configuration & knowledge center.
            </p>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HubSummaryCard
            title="Agents"
            count={agents.length}
            entityType="agent"
            topItems={agents.map((a) => ({
              label: a.name,
              subtitle: a.tier,
            }))}
            viewAllPath="/agents"
          />
          <HubSummaryCard
            title="Skills"
            count={skills.length}
            entityType="skill"
            topItems={skills.map((s) => ({
              label: s.name,
              subtitle: s.category,
            }))}
            viewAllPath="/skills"
          />
          <HubSummaryCard
            title="Configs"
            count={configs.length}
            entityType="config"
            topItems={configs.map((c) => ({
              label: c.name,
              subtitle: c.scope,
            }))}
            viewAllPath="/configs"
          />
        </div>

        {/* Recent Activity */}
        <RecentActivityFeed sessions={[]} />
      </div>
    </div>
  );
}

export default OpenCodePage;
