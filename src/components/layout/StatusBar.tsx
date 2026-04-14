import { useAppStore } from '../../state/app-store';
import { useFileWatcher } from '../../hooks/useFileWatcher';
import { MaterialIcon } from '../shared/MaterialIcon';

const VERSION = '1.2.0-stable';

function StatusBar() {
  const { sessionCount } = useAppStore();
  const { status } = useFileWatcher();

  const activeSessions = sessionCount > 0 ? `${sessionCount} Active Sessions` : '0 Active Sessions';

  return (
    <footer className="h-6 flex items-center justify-between px-3 border-t border-outline-variant/15 bg-surface-sidebar text-[10px] uppercase font-mono shrink-0 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center gap-4">
        <span className="text-on-surface-variant">v{VERSION}</span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
          <span className="text-tertiary">{activeSessions}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-on-surface-variant cursor-default">
          <MaterialIcon name="cloud_done" size={12} />
          <span>File Watcher: {status === 'connected' ? 'OK' : status === 'error' ? 'Error' : 'Idle'}</span>
        </div>
      </div>
    </footer>
  );
}

export default StatusBar;
