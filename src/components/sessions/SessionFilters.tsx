import type { SessionMeta } from '../../types/session';

interface SessionFiltersProps {
  meta: SessionMeta | null;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

export function SessionFilters({ meta, filters, onFilterChange }: SessionFiltersProps) {
  if (!meta) return null;

  return (
    <div className="flex flex-wrap gap-3 p-3 bg-sb-surface border border-sb-border rounded-lg" role="search" aria-label="Filter sessions">
      <select
        value={filters.agent || ''}
        onChange={e => onFilterChange('agent', e.target.value)}
        className="sb-input text-sm"
        aria-label="Filter by agent"
      >
        <option value="">All Agents</option>
        {meta.agents.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      <select
        value={filters.status || ''}
        onChange={e => onFilterChange('status', e.target.value)}
        className="sb-input text-sm"
        aria-label="Filter by status"
      >
        <option value="">All Statuses</option>
        {meta.statuses.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {(filters.agent || filters.status) && (
        <button
          onClick={() => { onFilterChange('agent', ''); onFilterChange('status', ''); }}
          className="sb-btn text-sm px-3 py-1"
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
