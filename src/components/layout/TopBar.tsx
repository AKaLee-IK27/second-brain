import { MaterialIcon } from '../shared/MaterialIcon';
import SearchBar from '../search/SearchBar';

interface TopBarProps {
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
}

/**
 * Monolithic Lexicon TopNavBar
 * - Background: surface-topbar (#161b22)
 * - Border: outline-variant/15 bottom border
 * - Height: h-12
 * - Typography: Space Grotesk for title
 */
function TopBar({ onSidebarToggle, sidebarCollapsed }: TopBarProps) {
  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-outline-variant/15 bg-surface-topbar shrink-0 fixed top-0 left-0 right-0 z-50">
      {/* Left: Sidebar toggle + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="text-on-surface-variant hover:text-primary transition-colors duration-150"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MaterialIcon name="vertical_split" size={20} />
        </button>
        <h1 className="font-headline font-bold text-lg tracking-tight text-on-surface">
          Monolithic Lexicon
        </h1>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-xl mx-4">
        <SearchBar />
      </div>

      {/* Right: Refresh + Settings */}
      <div className="flex items-center gap-3">
        <button
          className="text-on-surface-variant hover:text-primary transition-colors duration-150 scale-95 transition-transform duration-100"
          title="Refresh"
          onClick={() => window.location.reload()}
        >
          <MaterialIcon name="refresh" size={20} />
        </button>
        <button
          className="text-on-surface-variant hover:text-primary transition-colors duration-150 scale-95 transition-transform duration-100"
          title="Settings"
        >
          <MaterialIcon name="settings" size={20} />
        </button>
      </div>
    </header>
  );
}

export default TopBar;
