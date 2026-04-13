import { useState, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { SessionCard } from '../components/sessions/SessionCard';
import { SessionFilters } from '../components/sessions/SessionFilters';
import { EmptyState } from '../components/shared/EmptyState';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';

export default function SessionsPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data: sessionsData, loading } = useApi(
    () => api.sessions.list({ page, limit, ...filters }),
    [page, filters]
  );

  const { data: meta } = useApi(() => api.sessions.meta(), []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  if (loading) return <LoadingSkeleton lines={10} />;

  const sessions = sessionsData?.sessions || [];
  const total = sessionsData?.total || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-sb-text">Sessions</h1>
        <span className="text-sm text-sb-text-secondary">{total} sessions</span>
      </div>

      <SessionFilters meta={meta || null} filters={filters} onFilterChange={handleFilterChange} />

      {sessions.length === 0 ? (
        <EmptyState
          title="No sessions found"
          description={total === 0 ? "Run the migration tool to import your SQLite sessions." : "Try adjusting your filters."}
          action={total === 0 ? { label: "Run Migration", onClick: () => {} } : undefined}
        />
      ) : (
        <div className="space-y-2">
          {sessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="sb-btn px-3 py-1 text-sm disabled:opacity-50"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-sm text-sb-text-secondary">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * limit >= total}
            className="sb-btn px-3 py-1 text-sm disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
