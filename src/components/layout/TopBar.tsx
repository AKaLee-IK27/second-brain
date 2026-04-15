import { MaterialIcon } from '../shared/MaterialIcon';
import { useUIStore } from '../../state/ui-store';

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
  const { toggleSettings, setCommandPaletteOpen } = useUIStore();

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-outline-variant/15 bg-surface-topbar shrink-0 fixed top-0 left-0 right-0 z-50">
      {/* Left: Sidebar toggle + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="p-1.5 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container/50 transition-all duration-150"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MaterialIcon name="vertical_split" size={20} />
        </button>
        <h1 className="font-headline font-bold text-lg tracking-tight text-on-surface">
          Monolithic Lexicon
        </h1>
      </div>

      {/* Center: Global Search Trigger */}
      <div className="flex-1 max-w-xl mx-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg border border-outline-variant/15 
                     bg-surface-container-lowest hover:border-primary/30 transition-colors cursor-text"
        >
          <MaterialIcon name="search" size={16} className="text-outline-variant" />
          <span className="text-sm text-outline-variant">Search...</span>
          <kbd className="ml-auto text-[10px] text-outline-variant bg-surface-container-high border 
                          border-outline-variant/30 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
        </button>
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
          onClick={toggleSettings}
        >
          <MaterialIcon name="settings" size={20} />
        </button>
      </div>
    </header>
  );
}

export default TopBar;
