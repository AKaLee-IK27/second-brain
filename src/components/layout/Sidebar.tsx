import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../state/app-store';
import { Icon, type IconName } from '../shared/Icon';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: { path: string; icon: IconName; label: string }[] = [
  { path: '/sessions', icon: 'ClipboardList', label: 'Sessions' },
  { path: '/agents', icon: 'Users', label: 'Agents' },
  { path: '/skills', icon: 'Wrench', label: 'Skills' },
  { path: '/topics', icon: 'BookOpen', label: 'Topics' },
  { path: '/configs', icon: 'Settings', label: 'Configs' },
  { path: '/stats', icon: 'BarChart3', label: 'Stats' },
  { path: '/migration', icon: 'ArrowLeftRight', label: 'Migration' },
];

function statusColor(status: string): string {
  switch (status) {
    case 'watching':
      return 'var(--color-sb-success)';
    case 'error':
      return 'var(--color-sb-error)';
    default:
      return 'var(--color-sb-text-muted)';
  }
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className="w-2 h-2 rounded-full shrink-0"
      style={{ backgroundColor: statusColor(status) }}
    />
  );
}

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { dataRoot, watcherStatus } = useAppStore();

  const displayName = dataRoot
    ? dataRoot.split('/').pop() || dataRoot
    : 'Not configured';

  return (
    <aside
      className={`h-full flex flex-col bg-sb-surface border-r border-sb-border transition-all duration-200 ease-in-out ${
        collapsed ? 'w-12' : 'w-56'
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-b border-sb-border text-sb-text-secondary hover:text-sb-text hover:bg-sb-surface-alt transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Icon
          name={collapsed ? 'PanelLeft' : 'PanelLeftClose'}
          size={16}
          ariaHidden
        />
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-sb-accent/10 text-sb-accent font-medium'
                  : 'text-sb-text-secondary hover:text-sb-text hover:bg-sb-surface-alt'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon name={item.icon} size={16} ariaHidden />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sb-border p-3 space-y-2">
          {/* Data Root Indicator */}
          <div className="flex items-center gap-2 text-xs text-sb-text-muted">
            <Icon name="FolderOpen" size={12} ariaHidden />
            <span className="truncate" title={dataRoot || undefined}>
              {displayName}
            </span>
          </div>

          {/* File Watcher Status */}
          <div className="flex items-center gap-2 text-xs text-sb-text-muted">
            <StatusDot status={watcherStatus} />
            <span>
              {watcherStatus === 'watching'
                ? 'Watching'
                : watcherStatus === 'error'
                  ? 'Error'
                  : 'Idle'}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
