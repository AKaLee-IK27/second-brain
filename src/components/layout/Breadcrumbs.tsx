import { useLocation } from 'react-router-dom';

const routeLabels: Record<string, string> = {
  sessions: 'Sessions',
  agents: 'Agents',
  skills: 'Skills',
  topics: 'Topics',
  configs: 'Configs',
  stats: 'Stats',
  migration: 'Migration',
};

function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <div className="h-8 flex items-center px-4 border-b border-sb-border bg-sb-surface-alt shrink-0">
      <nav className="flex items-center gap-1 text-sm">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const label = routeLabels[segment] || segment;
          const path = `/${segments.slice(0, index + 1).join('/')}`;

          return (
            <div key={path} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-sb-text-muted">›</span>
              )}
              {isLast ? (
                <span className="text-sb-text font-medium truncate max-w-xs">
                  {label}
                </span>
              ) : (
                <a
                  href={path}
                  className="text-sb-text-secondary hover:text-sb-text transition-colors truncate max-w-xs"
                >
                  {label}
                </a>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export default Breadcrumbs;
