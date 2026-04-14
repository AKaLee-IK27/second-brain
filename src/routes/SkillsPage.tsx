import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { MaterialIcon } from '../components/shared/MaterialIcon';
import { SmartIcon, Wrench } from '../components/shared/AgentIcons';

const statusColors: Record<string, string> = {
  active: 'bg-tertiary/15 text-tertiary border-tertiary/20',
  deprecated: 'bg-error/15 text-error border-error/20',
  experimental: 'bg-secondary/15 text-secondary border-secondary/20',
};

export default function SkillsPage() {
  const [category, setCategory] = useState('');
  const { data, loading } = useApi(
    () => api.skills.list({ category: category || undefined }),
    [category],
  );

  const { data: allData } = useApi(() => api.skills.list(), []);
  const allSkills = allData?.skills || [];

  if (loading) return <LoadingSkeleton lines={8} />;

  const skills = data?.skills || [];
  const categories = [...new Set(allSkills.map((s) => s.category))];

  // Count by category
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = allSkills.filter(s => s.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex h-full">
      {/* Left Panel: Category Rail */}
      <aside className="w-64 bg-surface-container-low p-6 flex flex-col gap-8 overflow-y-auto">
        <div>
          <h2 className="font-headline font-bold text-lg mb-4 text-on-surface">Skills Registry</h2>
          <p className="font-serif text-sm text-on-surface-variant leading-relaxed">
            Specialized capabilities filtered by operational domain.
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
            <span>All Skills</span>
            <span className="bg-surface-container-low px-1.5 rounded text-[10px] font-mono">{allSkills.length}</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                category === cat
                  ? 'bg-surface-container-highest text-on-surface'
                  : 'text-on-surface-variant hover:bg-surface-container/50'
              }`}
            >
              <span>{cat}</span>
              <span className="text-[10px] font-mono opacity-50">{categoryCounts[cat] || 0}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Center Panel: Skills Grid */}
      <section className="flex-1 bg-background p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-tertiary" />
            <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Available Skills</h1>
          </div>
        </div>

        {skills.length === 0 ? (
          <EmptyState
            title="No skills found"
            description="Skill definitions will appear here once added to your data root."
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <Link
                key={skill.slug}
                to={`/skills/${skill.slug}`}
                className="group bg-surface-container-low rounded-[10px] p-6 transition-all duration-150 relative overflow-hidden border border-transparent hover:border-primary/20"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="text-tertiary">
                    <SmartIcon emoji={skill.emoji} size={32} className="w-8 h-8" defaultIcon={Wrench} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-headline font-bold tracking-widest border capitalize ${statusColors[skill.status] || statusColors.active}`}>
                    {skill.status || 'active'}
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-1">{skill.name}</h3>
                <div className="font-mono text-[11px] text-on-surface-variant mb-4 capitalize">{skill.category}</div>
                {skill.shortDescription && (
                  <p className="font-serif text-sm text-on-surface-variant leading-relaxed mb-6">
                    {skill.shortDescription}
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
