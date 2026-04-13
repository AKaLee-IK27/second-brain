import { useAppStore } from '../../state/app-store';
import { useFileWatcher } from '../../hooks/useFileWatcher';

const VERSION = '0.2.0';

function statusColor(status: string): string {
  switch (status) {
    case 'connected':
      return 'var(--color-sb-success)';
    case 'error':
      return 'var(--color-sb-error)';
    default:
      return 'var(--color-sb-text-muted)';
  }
}

function StatusBar() {
  const { sessionCount } = useAppStore();
  const { status, lastEvent } = useFileWatcher();

  const watcherLabel =
    status === 'connected'
      ? 'Watching'
      : status === 'error'
        ? 'Error'
        : 'Idle';

  return (
    <footer className="h-6 flex items-center justify-between px-4 border-t border-sb-border bg-sb-surface-alt text-xs text-sb-text-muted shrink-0">
      <span>AKL's Knowledge v{VERSION}</span>
      <div className="flex items-center gap-4">
        {sessionCount > 0 && <span>{sessionCount} sessions</span>}
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor(status) }}
          />
          <span
            className={
              status === 'connected'
                ? 'text-sb-success'
                : status === 'error'
                  ? 'text-sb-error'
                  : 'text-sb-text-muted'
            }
          >
            {watcherLabel}
          </span>
        </span>
        {lastEvent && (
          <span className="text-sb-text-muted ml-2">
            Last: {lastEvent.type} {lastEvent.path}
          </span>
        )}
      </div>
    </footer>
  );
}

export default StatusBar;
