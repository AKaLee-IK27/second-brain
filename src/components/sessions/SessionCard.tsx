import { Link } from 'react-router-dom';
import type { SessionSummary } from '../../types/session';
import { StatusBadge } from '../shared/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface SessionCardProps {
  session: SessionSummary;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link
      to={`/sessions/${session.id}`}
      className="block p-4 bg-sb-surface border border-sb-border rounded-lg hover:border-sb-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-sb-accent/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-sb-text truncate">{session.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-sb-text-secondary">{session.agent}</span>
            <span className="text-xs text-sb-text-muted" aria-hidden="true">•</span>
            <span className="text-xs text-sb-text-muted">
              {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-sb-text-muted">{session.tokens.total?.toLocaleString()} tokens</span>
          <span className="text-xs text-sb-text-muted">${session.cost?.toFixed(4)}</span>
          <StatusBadge status={session.status} />
        </div>
      </div>
      {session.tags && session.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {session.tags.slice(0, 3).map(tag => (
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
  );
}
