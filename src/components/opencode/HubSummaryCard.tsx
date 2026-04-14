import { Link } from 'react-router-dom';

interface HubSummaryCardProps {
  title: string;
  count: number;
  entityType: 'agent' | 'skill' | 'config';
  topItems: Array<{ label: string; subtitle?: string }>;
  viewAllPath: string;
}

export function HubSummaryCard({
  title,
  count,
  entityType,
  topItems,
  viewAllPath,
}: HubSummaryCardProps) {
  const pluralLabel = `${count} ${entityType}${count !== 1 ? 's' : ''}`;
  const emptyMessage = `No ${entityType}s found`;

  return (
    <div className="bg-surface-container-low p-5 rounded-lg border-l-2 border-primary group hover:bg-surface-container-high transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-[10px] uppercase tracking-tighter text-outline-variant">{title}</h3>
        <Link
          to={viewAllPath}
          className="text-xs text-primary hover:underline transition-colors font-mono"
        >
          View All →
        </Link>
      </div>

      {/* Count */}
      <div className="font-headline text-3xl font-bold text-on-surface">{pluralLabel}</div>

      {/* Content */}
      {count === 0 ? (
        <div className="text-sm text-outline-variant py-2">{emptyMessage}</div>
      ) : (
        <ul className="space-y-1 mt-3">
          {topItems.slice(0, 3).map((item, index) => (
            <li
              key={index}
              className="text-sm text-on-surface-variant truncate"
            >
              <span className="text-on-surface">{item.label}</span>
              {item.subtitle && (
                <span className="text-outline-variant ml-2">
                  · {item.subtitle}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
