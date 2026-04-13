import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../services/api';
import { useAppStore } from '../state/app-store';

export default function MigrationPage() {
  const navigate = useNavigate();
  const { dataRoot } = useAppStore();
  const [sqlitePath, setSqlitePath] = useState('~/.local/share/opencode/opencode.db');
  const [dryRun, setDryRun] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    status: string;
    errors: string[];
  }>({ current: 0, total: 0, status: 'idle', errors: [] });
  const [report, setReport] = useState<{
    migrated: number;
    failed: number;
    duration: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll status while migrating
  useEffect(() => {
    if (!migrating) return;

    const interval = setInterval(async () => {
      try {
        const status = await api.migration.status();
        setProgress({
          current: status.progress ?? 0,
          total: status.total ?? 0,
          status: status.status ?? 'idle',
          errors: [],
        });

        if (status.status === 'completed' || status.status === 'failed') {
          setMigrating(false);
          try {
            const rpt = await api.migration.report();
            setReport({
              migrated: rpt.migrated,
              failed: rpt.failed,
              duration: rpt.duration,
            });
            setProgress((prev) => ({
              ...prev,
              errors: rpt.errors ?? [],
            }));
          } catch {
            // Report fetch failed — status already shows completed/failed
          }
        }
      } catch {
        // Ignore polling errors — server may be busy
      }
    }, 500);

    return () => clearInterval(interval);
  }, [migrating]);

  const handleStart = useCallback(async () => {
    setError(null);
    setReport(null);
    setProgress({ current: 0, total: 0, status: 'running', errors: [] });
    setMigrating(true);

    try {
      await api.migration.start({
        sqlitePath,
        outputRoot: dataRoot ?? '',
        dryRun,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setMigrating(false);
      } else {
        setError('An unexpected error occurred');
        setMigrating(false);
      }
    }
  }, [sqlitePath, dataRoot, dryRun]);

  const pct =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-sb-text">
          Migrate Sessions
        </h1>
        <p className="text-sb-text-secondary mt-1">
          Convert your existing opencode SQLite sessions to markdown files.
        </p>
      </div>

      {/* Configuration Card */}
      <div className="sb-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-sb-text mb-1">
            SQLite Database Path
          </label>
          <input
            type="text"
            value={sqlitePath}
            onChange={(e) => setSqlitePath(e.target.value)}
            className="sb-input w-full font-mono text-sm"
            placeholder="~/.local/share/opencode/opencode.db"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="dryRun"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="rounded border-sb-border bg-sb-surface-alt"
          />
          <label
            htmlFor="dryRun"
            className="text-sm text-sb-text-secondary"
          >
            Dry run (preview without writing files)
          </label>
        </div>

        {error && (
          <div className="p-3 bg-sb-error/10 border border-sb-error/30 rounded-lg text-sm text-sb-error">
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={migrating || !dataRoot}
          className="sb-btn sb-btn-accent px-6 py-2 disabled:opacity-50"
        >
          {migrating ? 'Migrating...' : 'Start Migration'}
        </button>
      </div>

      {/* Progress Card */}
      {(migrating || progress.total > 0 || report) && (
        <div className="sb-card p-6 space-y-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-sb-text">
              {progress.status === 'completed'
                ? '✅ Migration Complete'
                : progress.status === 'failed'
                  ? '❌ Migration Failed'
                  : `Migrating... ${progress.current}/${progress.total}`}
            </span>
            <span className="text-sm text-sb-text-secondary">{pct}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-sb-surface-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-sb-accent transition-all duration-300 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Errors */}
          {progress.errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-sb-error">
                {progress.errors.length} error(s):
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {progress.errors.slice(0, 10).map((err, i) => (
                  <p
                    key={i}
                    className="text-xs text-sb-error/80 font-mono truncate"
                  >
                    {err}
                  </p>
                ))}
                {progress.errors.length > 10 && (
                  <p className="text-xs text-sb-text-muted">
                    ...and {progress.errors.length - 10} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Completion Report */}
          {report && (
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-sb-success">
                  {report.migrated}
                </div>
                <div className="text-xs text-sb-text-secondary">
                  Migrated
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sb-error">
                  {report.failed}
                </div>
                <div className="text-xs text-sb-text-secondary">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sb-text">
                  {report.duration}
                </div>
                <div className="text-xs text-sb-text-secondary">Duration</div>
              </div>
            </div>
          )}

          {/* View Sessions Button */}
          {report && report.migrated > 0 && !dryRun && (
            <button
              onClick={() => navigate('/sessions')}
              className="sb-btn sb-btn-success px-6 py-2"
            >
              View Sessions →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
