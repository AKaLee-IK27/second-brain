import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { MarkdownRenderer } from '../components/shared/MarkdownRenderer';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { Icon } from '../components/shared/Icon';

export default function AgentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = useApi(
    () => api.agents.get(slug!),
    [slug],
  );

  if (loading) return <LoadingSkeleton lines={15} />;
  if (error)
    return (
      <EmptyState
        title="Error"
        description={error.message}
        action={{ label: 'Back to Agents', onClick: () => window.history.back() }}
      />
    );
  if (!data)
    return (
      <EmptyState
        title="Agent not found"
        description=""
        action={{ label: 'Back to Agents', onClick: () => window.history.back() }}
      />
    );

  const { frontmatter, body } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/agents" className="text-sm text-sb-accent hover:underline">
        &larr; Back to Agents
      </Link>

      <div className="pb-4 border-b border-sb-border">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">
            {frontmatter.emoji || <Icon name="Bot" size={40} ariaHidden />}
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-sb-text">
              {frontmatter.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-sb-text-secondary">
                {frontmatter.model}
              </span>
              <span className="px-2 py-0.5 text-xs border rounded-full bg-sb-accent/20 text-sb-accent border-sb-accent/30">
                {frontmatter.tier}
              </span>
              <span className="px-2 py-0.5 text-xs border rounded-full bg-sb-success/20 text-sb-success border-sb-success/30">
                {frontmatter.status}
              </span>
            </div>
          </div>
        </div>
        {frontmatter.whenToUse && (
          <p className="text-sb-text-secondary mt-2">
            {frontmatter.whenToUse}
          </p>
        )}
      </div>

      <MarkdownRenderer content={body} />
    </div>
  );
}
