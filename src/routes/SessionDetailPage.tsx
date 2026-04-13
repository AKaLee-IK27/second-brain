import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { MarkdownRenderer } from '../components/shared/MarkdownRenderer';
import { StatusBadge } from '../components/shared/StatusBadge';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { format } from 'date-fns';

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: session, loading, error } = useApi(
    () => api.sessions.get(id!),
    [id]
  );

  if (loading) return <LoadingSkeleton lines={15} />;
  if (error) return <EmptyState title="Error" description={error.message} action={{ label: "Back to Sessions", onClick: () => navigate('/sessions') }} />;
  if (!session) return <EmptyState title="Session not found" description="" action={{ label: "Back to Sessions", onClick: () => navigate('/sessions') }} />;

  const { frontmatter, body } = session;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link to="/sessions" className="text-sm text-sb-accent hover:underline">
        ← Back to Sessions
      </Link>

      {/* Header */}
      <div className="pb-4 border-b border-sb-border">
        <h1 className="text-2xl font-semibold text-sb-text mb-3">{frontmatter.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-sb-text-secondary">{frontmatter.agent}</span>
          <StatusBadge status={frontmatter.status} />
          <span className="text-xs text-sb-text-muted">
            {format(new Date(frontmatter.createdAt), 'MMM d, yyyy HH:mm')}
          </span>
          <span className="text-xs text-sb-text-muted">
            {frontmatter.tokens.total?.toLocaleString()} tokens
          </span>
          <span className="text-xs text-sb-text-muted">
            ${frontmatter.cost?.toFixed(4)}
          </span>
        </div>
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {frontmatter.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-sb-surface-alt text-sb-text-secondary rounded-full">
                {tag}
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
