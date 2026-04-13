import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { format } from 'date-fns';

const typeColors: Record<string, string> = {
  article: 'bg-sb-accent/20 text-sb-accent border-sb-accent/30',
  blog: 'bg-sb-purple/20 text-sb-purple border-sb-purple/30',
  tutorial: 'bg-sb-success/20 text-sb-success border-sb-success/30',
  'research-note': 'bg-sb-warning/20 text-sb-warning border-sb-warning/30',
  reference: 'bg-sb-text-muted/20 text-sb-text-muted border-sb-text-muted/30',
};

export default function TopicsPage() {
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');

  const { data: topicsData, loading: tLoading } = useApi(
    () =>
      api.topics.list({
        category: category || undefined,
        type: type || undefined,
      }),
    [category, type],
  );

  const { data: categoriesData } = useApi(
    () => api.topics.categories(),
    [],
  );

  const topics = topicsData?.topics || [];
  const categories = categoriesData?.categories || [];

  if (tLoading) return <LoadingSkeleton lines={8} />;

  return (
    <div className="flex gap-6">
      {/* Category Sidebar */}
      <div className="w-48 shrink-0">
        <h3 className="text-sm font-semibold text-sb-text mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => setCategory('')}
            className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
              !category
                ? 'bg-sb-accent/20 text-sb-accent'
                : 'text-sb-text-secondary hover:bg-sb-surface-alt'
            }`}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 text-sm rounded transition-colors flex justify-between ${
                category === cat.slug
                  ? 'bg-sb-accent/20 text-sb-accent'
                  : 'text-sb-text-secondary hover:bg-sb-surface-alt'
              }`}
            >
              <span className="capitalize">{cat.slug}</span>
              <span className="text-xs text-sb-text-muted">{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <h3 className="text-sm font-semibold text-sb-text mt-6 mb-3">Type</h3>
        <div className="space-y-1">
          {['', 'article', 'blog', 'tutorial', 'research-note', 'reference'].map(
            (t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors capitalize ${
                  type === t
                    ? 'bg-sb-accent/20 text-sb-accent'
                    : 'text-sb-text-secondary hover:bg-sb-surface-alt'
                }`}
              >
                {t || 'All Types'}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Topic List */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-sb-text">Topics</h1>
          <span className="text-sm text-sb-text-secondary">
            {topics.length} topics
          </span>
        </div>

        {topics.length === 0 ? (
          <EmptyState
            title="No topics found"
            description="Knowledge articles will appear here once created."
          />
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                to={`/topics/${topic.slug}`}
                className="block sb-card p-5 hover:border-sb-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-xs border rounded-full capitalize ${typeColors[topic.type] || typeColors.article}`}
                      >
                        {topic.type}
                      </span>
                      <span className="px-2 py-0.5 text-xs border rounded-full bg-sb-surface-alt text-sb-text-secondary capitalize">
                        {topic.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-sb-text truncate">
                      {topic.title}
                    </h3>
                    {topic.summary && (
                      <p className="text-xs text-sb-text-secondary mt-1 line-clamp-2">
                        {topic.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-sb-text-muted">
                      {topic.createdAt && (
                        <span>
                          {format(new Date(topic.createdAt), 'MMM d, yyyy')}
                        </span>
                      )}
                      {topic.readTime && <span>{topic.readTime} min read</span>}
                    </div>
                  </div>
                </div>
                {topic.tags && topic.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {topic.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-xs bg-sb-surface-alt text-sb-text-secondary rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
