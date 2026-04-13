import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { MarkdownRenderer } from '../components/shared/MarkdownRenderer';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { format } from 'date-fns';

export default function TopicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = useApi(
    () => api.topics.get(slug!),
    [slug],
  );

  if (loading) return <LoadingSkeleton lines={15} />;
  if (error)
    return (
      <EmptyState
        title="Error"
        description={error.message}
        action={{ label: 'Back to Topics', onClick: () => window.history.back() }}
      />
    );
  if (!data)
    return (
      <EmptyState
        title="Topic not found"
        description=""
        action={{ label: 'Back to Topics', onClick: () => window.history.back() }}
      />
    );

  const { frontmatter, body } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/topics" className="text-sm text-sb-accent hover:underline">
        ← Back to Topics
      </Link>

      {/* Header */}
      <div className="pb-4 border-b border-sb-border">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 text-xs border rounded-full bg-sb-accent/20 text-sb-accent border-sb-accent/30 capitalize">
            {frontmatter.type || 'article'}
          </span>
          <span className="px-2 py-0.5 text-xs border rounded-full bg-sb-surface-alt text-sb-text-secondary capitalize">
            {frontmatter.category}
          </span>
          <span className="px-2 py-0.5 text-xs border rounded-full bg-sb-success/20 text-sb-success border-sb-success/30 capitalize">
            {frontmatter.status || 'draft'}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-sb-text mb-3">
          {frontmatter.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-sb-text-secondary">
          {frontmatter.createdAt && (
            <span>
              {format(new Date(frontmatter.createdAt), 'MMMM d, yyyy')}
            </span>
          )}
          {frontmatter.readTime && (
            <span>{frontmatter.readTime} min read</span>
          )}
          {frontmatter.author && <span>by {frontmatter.author}</span>}
        </div>
        {frontmatter.summary && (
          <p className="text-sb-text-secondary mt-3">{frontmatter.summary}</p>
        )}
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {frontmatter.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-sb-surface-alt text-sb-text-secondary rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <MarkdownRenderer content={body} />
    </div>
  );
}
