import { Link } from 'react-router-dom';
import type { SessionSummary } from '../../types/session';
import { formatDistanceToNow } from 'date-fns';
import { MaterialIcon } from '../shared/MaterialIcon';

interface SessionCardProps {
  session: SessionSummary;
}

function statusAccentColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'running':
      return 'bg-sb-warning';
    case 'completed':
    case 'done':
      return 'bg-outline-variant';
    case 'review':
      return 'bg-primary-container';
    case 'error':
    case 'failed':
      return 'bg-error';
    default:
      return 'bg-outline-variant';
  }
}

function statusBadgeColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'running':
      return 'bg-sb-warning/15 text-sb-warning';
    case 'completed':
    case 'done':
      return 'bg-outline-variant/15 text-outline-variant';
    case 'review':
      return 'bg-primary-container/15 text-primary-container';
    case 'error':
    case 'failed':
      return 'bg-error/15 text-error';
    default:
      return 'bg-outline-variant/15 text-outline-variant';
  }
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link
      to={`/sessions/${session.id}`}
      className="group flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high transition-all duration-150 rounded-lg cursor-pointer"
    >
      <div className="flex items-center gap-4 overflow-hidden">
        {/* Colored left accent bar */}
        <div className={`w-1.5 h-10 ${statusAccentColor(session.status)} rounded-full shrink-0`} />
        <div className="flex flex-col min-w-0">
          <h3 className="text-sm font-semibold text-on-surface truncate font-headline">{session.title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant">
              🤖 {session.agent}
            </span>
            <span className="text-[10px] font-mono text-outline-variant">|</span>
            <span className="text-[10px] font-mono text-outline-variant">
              {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[10px] font-mono text-on-surface-variant">{session.tokens.total?.toLocaleString()} tokens</span>
          <span className="text-[10px] font-mono text-tertiary">${session.cost?.toFixed(2)}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${statusBadgeColor(session.status)}`}>
          {session.status}
        </span>
        <MaterialIcon name="chevron_right" size={18} className="text-outline-variant group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}
