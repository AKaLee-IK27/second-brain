import type { SessionMeta } from '../../types/session';
import { MaterialIcon } from '../shared/MaterialIcon';

interface SessionFiltersProps {
  meta: SessionMeta | null;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

export function SessionFilters({ meta, filters, onFilterChange }: SessionFiltersProps) {
  if (!meta) return null;

  return (
    <div className="flex items-center gap-3" role="search" aria-label="Filter sessions">
      {/* Agent Filter Chip */}
      <div className="relative">
        <select
          value={filters.agent || ''}
          onChange={e => onFilterChange('agent', e.target.value)}
          className="appearance-none bg-surface-container-high border border-outline-variant/30 rounded px-3 py-1.5 text-xs font-mono text-on-surface cursor-pointer hover:border-primary/50 transition-colors pr-8 focus:outline-none focus:border-primary/50"
          aria-label="Filter by agent"
        >
          <option value="">agent:all</option>
          {meta.agents.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <MaterialIcon name="expand_more" size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none" />
      </div>

      {/* Status Filter Chip */}
      <div className="relative">
        <select
          value={filters.status || ''}
          onChange={e => onFilterChange('status', e.target.value)}
          className="appearance-none bg-surface-container-high border border-outline-variant/30 rounded px-3 py-1.5 text-xs font-mono text-on-surface cursor-pointer hover:border-primary/50 transition-colors pr-8 focus:outline-none focus:border-primary/50"
          aria-label="Filter by status"
        >
          <option value="">status:all</option>
          {meta.statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <MaterialIcon name="expand_more" size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none" />
      </div>

      {/* Clear Filters */}
      {(filters.agent || filters.status) && (
        <button
          onClick={() => { onFilterChange('agent', ''); onFilterChange('status', ''); }}
          className="text-[10px] font-mono text-outline-variant hover:text-primary transition-colors flex items-center gap-1"
          aria-label="Clear all filters"
        >
          <MaterialIcon name="close" size={12} />
          Clear
        </button>
      )}
    </div>
  );
}
