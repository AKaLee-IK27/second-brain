import { SHORTCUT_DEFINITIONS, getShortcutsByCategory, getDisplayKeys, type ShortcutCategory } from '../../config/shortcuts-definitions';

const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  global: 'Global',
  navigation: 'Navigation',
  editor: 'Editor',
};

export function HotkeyMapTab() {
  const grouped = getShortcutsByCategory();
  const categories: ShortcutCategory[] = ['global', 'navigation', 'editor'];

  if (SHORTCUT_DEFINITIONS.length === 0) {
    return (
      <div className="p-4 text-center text-on-surface-variant">
        No keyboard shortcuts defined
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {categories.map((category) => {
        const shortcuts = grouped[category];
        if (shortcuts.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="font-headline text-sm font-medium text-on-surface-variant uppercase tracking-wide mb-2">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="space-y-1">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between py-2 border-b border-outline-variant/15 last:border-b-0"
                >
                  <span className="text-sm text-on-surface">{shortcut.action}</span>
                  <div className="flex items-center gap-1">
                    {getDisplayKeys(shortcut).map((key, index) => (
                      <span key={index} className="flex items-center">
                        <kbd className="font-mono text-xs bg-surface-container border border-outline-variant/30 rounded-sm px-2 py-1 text-on-surface-variant">
                          {key}
                        </kbd>
                        {index < getDisplayKeys(shortcut).length - 1 && (
                          <span className="text-on-surface-variant mx-0.5">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
