import { Icon } from '../shared/Icon';
import SearchBar from '../search/SearchBar';

interface TopBarProps {
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
}

function TopBar({ onSidebarToggle, sidebarCollapsed }: TopBarProps) {
  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-sb-border bg-sb-surface shrink-0">
      {/* Left: Sidebar toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSidebarToggle}
          className="sb-btn px-2 py-1 text-sm text-sb-text-secondary"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name="PanelLeft" size={16} ariaHidden />
        </button>
        <h1 className="font-semibold text-base tracking-tight text-sb-text">
          <Icon name="Brain" size={20} ariaHidden /> AKL's Knowledge
        </h1>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-xl mx-4">
        <SearchBar />
      </div>

      {/* Right: Refresh + Settings */}
      <div className="flex items-center gap-2">
        <button
          className="sb-btn px-2 py-1 text-sm text-sb-text-secondary"
          title="Refresh"
          onClick={() => window.location.reload()}
        >
          <Icon name="RefreshCw" size={16} ariaHidden />
        </button>
        <button
          className="sb-btn px-2 py-1 text-sm text-sb-text-secondary"
          title="Settings"
        >
          <Icon name="Settings" size={16} ariaHidden />
        </button>
      </div>
    </header>
  );
}

export default TopBar;
