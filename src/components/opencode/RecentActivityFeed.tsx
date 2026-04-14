import { MaterialIcon } from '../shared/MaterialIcon';

interface SessionActivity {
  id: string;
  title: string;
  agent?: string;
  skills?: string[];
  createdAt: number;
}

interface RecentActivityFeedProps {
  sessions: SessionActivity[];
}

export function RecentActivityFeed({ sessions }: RecentActivityFeedProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
        <h3 className="font-headline text-sm font-semibold uppercase tracking-widest text-on-surface mb-3">
          Recent Activity
        </h3>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <MaterialIcon name="inbox" size={20} />
          <p className="font-serif text-sm">
            No recent activity. Activity will appear after you run sessions with opencode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
      <h3 className="font-headline text-sm font-semibold uppercase tracking-widest text-on-surface mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4 font-mono text-[11px]">
        {sessions.slice(0, 5).map((session) => (
          <div key={session.id} className="flex gap-3 text-on-surface-variant">
            <span className="text-primary-container shrink-0">
              {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <p>
              <span className="text-on-surface">{session.title}</span>
              {session.agent && (
                <span className="text-outline-variant"> used {session.agent}</span>
              )}
              {session.skills && session.skills.length > 0 && (
                <span className="text-outline-variant"> + {session.skills.length} skill(s)</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
