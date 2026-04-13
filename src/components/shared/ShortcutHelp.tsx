import { useUIStore } from '../../state/ui-store';
import { Icon } from '../shared/Icon';

const SHORTCUTS = [
  { action: 'Command Palette', shortcut: 'Ctrl+K' },
  { action: 'New Note', shortcut: 'Ctrl+N' },
  { action: 'Toggle Sidebar', shortcut: 'Ctrl+\\' },
  { action: 'Toggle Right Panel', shortcut: 'Ctrl+/' },
  { action: 'Focus Mode', shortcut: 'Ctrl+.' },
  { action: 'Graph View', shortcut: 'G' },
  { action: 'Bold', shortcut: 'Ctrl+B' },
  { action: 'Italic', shortcut: 'Ctrl+I' },
  { action: 'Heading', shortcut: 'Ctrl+Shift+H' },
  { action: 'Wikilink', shortcut: '[[ ' },
  { action: 'Show Shortcuts', shortcut: 'Ctrl+?' },
];

function ShortcutHelp() {
  const { toggleShortcutHelp } = useUIStore();

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleShortcutHelp();
      }}
    >
      <div className="sb-card w-full max-w-md p-6 bg-sb-surface shadow-sb-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-sb-text">
            <Icon name="Keyboard" size={18} ariaHidden /> Keyboard Shortcuts
          </h2>
          <button
            onClick={toggleShortcutHelp}
            className="sb-btn px-2 py-1 text-sb-text-secondary"
            aria-label="Close"
          >
            <Icon name="X" size={16} ariaHidden />
          </button>
        </div>

        <div className="space-y-1">
          {SHORTCUTS.map((s) => (
            <div
              key={s.shortcut}
              className="flex items-center justify-between py-2 border-b border-sb-border last:border-b-0"
            >
              <span className="font-display text-sm text-sb-text">
                {s.action}
              </span>
              <kbd className="font-mono text-xs bg-sb-surface-alt border border-sb-border rounded-sm px-2 py-1 text-sb-text-secondary">
                {s.shortcut}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-sb-border text-center text-sm text-sb-text-muted">
          Press{' '}
          <kbd className="font-mono bg-sb-surface-alt border border-sb-border rounded-sm px-1 text-sb-text-secondary">
            Esc
          </kbd>{' '}
          to close
        </div>
      </div>
    </div>
  );
}

export default ShortcutHelp;
