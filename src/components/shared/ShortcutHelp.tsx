import { useUIStore } from '../../state/ui-store';
import { MaterialIcon } from '../shared/MaterialIcon';
import { SHORTCUT_DEFINITIONS, getDisplayKeys } from '../../config/shortcuts-definitions';

function ShortcutHelp() {
  const { toggleShortcutHelp } = useUIStore();

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleShortcutHelp();
      }}
    >
      <div className="bg-surface-container-highest border border-outline-variant/15 rounded-xl w-full max-w-md p-6 shadow-sb-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline font-semibold text-lg text-on-surface flex items-center gap-2">
            <MaterialIcon name="keyboard" size={18} /> Keyboard Shortcuts
          </h2>
          <button
            onClick={toggleShortcutHelp}
            className="sb-btn px-2 py-1 text-on-surface-variant"
            aria-label="Close"
          >
            <MaterialIcon name="close" size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {SHORTCUT_DEFINITIONS.map((shortcut) => {
            const displayKeys = getDisplayKeys(shortcut);
            return (
              <div
                key={shortcut.id}
                className="flex items-center justify-between py-2 border-b border-outline-variant/15 last:border-b-0"
              >
                <span className="font-headline text-sm text-on-surface">
                  {shortcut.action}
                </span>
                <div className="flex items-center gap-1">
                  {displayKeys.map((key, index) => (
                    <span key={index} className="flex items-center">
                      <kbd className="font-mono text-xs bg-surface-container border border-outline-variant/30 rounded-sm px-2 py-1 text-on-surface-variant">
                        {key}
                      </kbd>
                      {index < displayKeys.length - 1 && (
                        <span className="text-on-surface-variant mx-0.5">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-outline-variant/15 text-center text-sm text-outline-variant">
          Press{' '}
          <kbd className="font-mono bg-surface-container border border-outline-variant/30 rounded-sm px-1 text-on-surface-variant">
            Esc
          </kbd>{' '}
          to close
        </div>
      </div>
    </div>
  );
}

export default ShortcutHelp;
