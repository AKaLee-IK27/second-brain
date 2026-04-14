import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../services/api';
import { useAppStore } from '../state/app-store';
import { MaterialIcon } from '../components/shared/MaterialIcon';

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
            // Report fetch failed
          }
        }
      } catch {
        // Ignore polling errors
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

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  const currentStep = migrating ? 3 : report ? 4 : progress.total > 0 ? 2 : 1;

  return (
    <div className="p-8 min-h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-2">Knowledge Migration</h1>
            <p className="font-serif text-on-surface-variant max-w-xl text-lg italic">
              Relocate intellectual assets between Lexicon clusters with precision and cryptographic integrity.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <MaterialIcon name="shield" size={14} />
            ENC_AES_256_GCM
          </div>
        </div>

        {/* Wizard Progress */}
        <div className="relative mb-16 px-4">
          <div className="flex justify-between items-center relative z-10">
            {[
              { num: 1, label: 'Configure' },
              { num: 2, label: 'Preview' },
              { num: 3, label: 'Migrate' },
              { num: 4, label: 'Complete' },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold border-2 transition-all ${
                  currentStep >= step.num
                    ? 'bg-primary-container text-on-primary-container border-primary-container shadow-lg shadow-primary-container/20'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30'
                }`}>
                  {String(step.num).padStart(2, '0')}
                </div>
                <span className={`font-label text-[10px] uppercase tracking-widest ${
                  currentStep >= step.num ? 'text-primary font-bold' : 'text-on-surface-variant'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
            {/* Connector lines */}
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-[2px] -z-0">
              <div className="w-full h-full bg-surface-container-highest relative">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-container to-surface-container-highest transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Config Panel */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <section className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-8">
                <MaterialIcon name="database" size={24} className="text-secondary" />
                <h2 className="font-headline text-xl font-medium tracking-tight">Source Definition</h2>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase text-on-surface-variant tracking-wider">SQLite Database Path</label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-primary text-xs">&gt;</span>
                  <input
                    type="text"
                    value={sqlitePath}
                    onChange={(e) => setSqlitePath(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 pl-7 py-2 font-mono text-sm text-on-surface transition-colors duration-200 placeholder:text-outline-variant/50"
                    placeholder="~/.local/share/opencode/opencode.db"
                  />
                  <div className="absolute right-0 bottom-[-1px] h-[1px] w-0 bg-primary group-focus-within:w-full transition-all duration-300" />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${dryRun ? 'bg-primary-container/20 border border-primary-container/40' : 'bg-surface-container-highest border border-outline-variant'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full shadow-sm transition-all ${dryRun ? 'right-1 bg-primary' : 'left-1 bg-on-surface-variant'}`} />
                  </div>
                  <span className="text-sm text-on-surface-variant">Dry run (preview without writing)</span>
                </label>
                <input type="checkbox" id="dryRun" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="sr-only" />
              </div>

              {error && (
                <div className="mt-4 p-3 bg-error-container/20 border border-error/30 rounded-lg text-sm text-error">
                  {error}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Manifest Summary */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-highest rounded-lg p-6 overflow-hidden relative border border-outline-variant/20 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <h3 className="font-label text-[10px] uppercase tracking-widest text-primary mb-6">Manifest Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
                  <span className="font-serif italic text-sm text-on-surface-variant">Status</span>
                  <span className={`font-mono text-sm ${migrating ? 'text-primary' : report ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                    {migrating ? 'RUNNING' : report ? 'COMPLETE' : 'READY'}
                  </span>
                </div>
                {report && (
                  <>
                    <div className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
                      <span className="font-serif italic text-sm text-on-surface-variant">Migrated</span>
                      <span className="font-mono text-sm text-tertiary">{report.migrated}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
                      <span className="font-serif italic text-sm text-on-surface-variant">Failed</span>
                      <span className="font-mono text-sm text-error">{report.failed}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
                      <span className="font-serif italic text-sm text-on-surface-variant">Duration</span>
                      <span className="font-mono text-sm text-on-surface">{report.duration}</span>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={handleStart}
                disabled={migrating || !dataRoot}
                className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-headline font-bold rounded-lg shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {migrating ? 'MIGRATING...' : 'START MIGRATION'}
                <MaterialIcon name="arrow_forward" size={18} />
              </button>
            </div>

            {/* Warning Card */}
            <div className="bg-surface-container-low p-6 rounded-lg border-l-4 border-secondary/50">
              <div className="flex items-start gap-4">
                <MaterialIcon name="warning" size={20} className="text-secondary mt-1" />
                <div>
                  <h4 className="font-headline text-sm font-bold text-on-surface">Read-Only Lock</h4>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed mt-1">
                    Migration will trigger a temporary atomic lock on the source node. Ensure all active threads are committed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress / Terminal Log */}
        {(migrating || progress.total > 0 || report) && (
          <div className="mt-12">
            {/* Progress Bar */}
            {migrating && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-outline-variant uppercase">Progress</span>
                  <span className="font-mono text-[10px] text-primary">{pct}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}

            {/* Terminal Log View */}
            <div className="rounded-lg overflow-hidden border border-outline-variant/10">
              <div className="bg-surface-container-high px-4 py-2 border-b border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-error/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-tertiary/40" />
                  </div>
                  <span className="font-mono text-[10px] uppercase text-on-surface-variant ml-4">Terminal: Process Watcher</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-4 h-48 font-mono text-xs overflow-y-auto leading-relaxed">
                <div className="flex gap-4">
                  <span className="text-on-surface-variant opacity-40">--:--:--</span>
                  <span className="text-tertiary">[SYSTEM]</span>
                  <span className="text-on-surface">Awaiting configuration parameters...</span>
                </div>
                {sqlitePath && (
                  <div className="flex gap-4 mt-1">
                    <span className="text-on-surface-variant opacity-40">--:--:--</span>
                    <span className="text-primary-container">[INFO]</span>
                    <span className="text-on-surface">Source path set: {sqlitePath}</span>
                  </div>
                )}
                {migrating && (
                  <>
                    <div className="flex gap-4 mt-1">
                      <span className="text-on-surface-variant opacity-40">--:--:--</span>
                      <span className="text-primary-container">[INFO]</span>
                      <span className="text-on-surface">Scanning filesystem...</span>
                    </div>
                    <div className="flex gap-4 mt-1">
                      <span className="text-on-surface-variant opacity-40">--:--:--</span>
                      <span className="text-primary-container">[INFO]</span>
                      <span className="text-on-surface">Processing {progress.current}/{progress.total} sessions...</span>
                    </div>
                  </>
                )}
                {report && (
                  <div className="flex gap-4 mt-1">
                    <span className="text-on-surface-variant opacity-40">--:--:--</span>
                    <span className="text-tertiary">[SYSTEM]</span>
                    <span className="text-on-surface">Migration complete: {report.migrated} migrated, {report.failed} failed in {report.duration}</span>
                  </div>
                )}
                {progress.errors.length > 0 && progress.errors.slice(0, 5).map((err, idx) => (
                  <div key={idx} className="flex gap-4 mt-1">
                    <span className="text-on-surface-variant opacity-40">--:--:--</span>
                    <span className="text-secondary">[WARN]</span>
                    <span className="text-on-surface">{err}</span>
                  </div>
                ))}
                <div className="flex gap-4 mt-1 animate-pulse">
                  <span className="text-on-surface-variant opacity-40">--:--:--</span>
                  <span className="text-primary">&gt;</span>
                  <span className="text-on-surface">_</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Sessions Button */}
        {report && report.migrated > 0 && !dryRun && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/sessions')}
              className="sb-btn-primary px-8 py-3 rounded-lg font-headline font-bold flex items-center gap-2"
            >
              View Sessions
              <MaterialIcon name="arrow_forward" size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
