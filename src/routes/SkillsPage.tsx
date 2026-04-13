import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { Icon } from '../components/shared/Icon';

const statusColors: Record<string, string> = {
  active: 'bg-sb-success/20 text-sb-success border-sb-success/30',
  deprecated: 'bg-sb-error/20 text-sb-error border-sb-error/30',
  experimental: 'bg-sb-warning/20 text-sb-warning border-sb-warning/30',
};

export default function SkillsPage() {
  const [category, setCategory] = useState('');
  const { data, loading } = useApi(
    () => api.skills.list({ category: category || undefined }),
    [category],
  );

  if (loading) return <LoadingSkeleton lines={8} />;

  const skills = data?.skills || [];
  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-sb-text">Skills</h1>
        <span className="text-sm text-sb-text-secondary">
          {skills.length} skills
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategory('')}
          className={`sb-btn px-3 py-1 text-sm ${
            !category ? 'sb-btn-accent' : ''
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`sb-btn px-3 py-1 text-sm capitalize ${
              category === cat ? 'sb-btn-accent' : ''
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {skills.length === 0 ? (
        <EmptyState
          title="No skills found"
          description="Skill definitions will appear here once added to your data root."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <Link
              key={skill.slug}
              to={`/skills/${skill.slug}`}
              className="sb-card p-5 hover:border-sb-accent/50 transition-colors block"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">
                  {skill.emoji || <Icon name="Wrench" size={32} ariaHidden />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-sb-text truncate">
                      {skill.name}
                    </h3>
                    <span
                      className={`px-1.5 py-0.5 text-xs border rounded-full ${
                        statusColors[skill.status] || statusColors.active
                      }`}
                    >
                      {skill.status}
                    </span>
                  </div>
                  <p className="text-xs text-sb-text-secondary mt-1 capitalize">
                    {skill.category}
                  </p>
                  {skill.shortDescription && (
                    <p className="text-xs text-sb-text-muted mt-2 line-clamp-2">
                      {skill.shortDescription}
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
