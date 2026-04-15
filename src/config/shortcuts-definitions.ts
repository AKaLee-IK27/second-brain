/**
 * Single source of truth for keyboard shortcut definitions.
 * 
 * This module provides display-only shortcut data consumed by:
 * - Settings Panel (HotkeyMapTab)
 * - ShortcutHelp modal
 * - CommandPalette (display labels only)
 * 
 * Note: useKeyboardShortcuts.ts retains its own handler logic for complex
 * context like "only when not typing". Hook migration is deferred.
 */

export type ShortcutCategory = 'global' | 'navigation' | 'editor';

export interface ShortcutDefinition {
  id: string;           // unique identifier, e.g. 'command-palette'
  action: string;       // display name, e.g. 'Command Palette'
  category: ShortcutCategory;
  keys: string[];       // individual keys, e.g. ['Ctrl', 'K']
}

/**
 * All keyboard shortcuts defined in a single source of truth.
 */
export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  // Global shortcuts
  { id: 'command-palette', action: 'Command Palette', category: 'global', keys: ['Ctrl', 'K'] },
  { id: 'new-note', action: 'New Note', category: 'global', keys: ['Ctrl', 'N'] },
  { id: 'toggle-sidebar', action: 'Toggle Sidebar', category: 'global', keys: ['Ctrl', '\\'] },
  { id: 'toggle-right-panel', action: 'Toggle Right Panel', category: 'global', keys: ['Ctrl', '/'] },
  { id: 'focus-mode', action: 'Focus Mode', category: 'global', keys: ['Ctrl', '.'] },
  { id: 'show-shortcuts', action: 'Show Shortcuts', category: 'global', keys: ['Ctrl', 'Shift', '?'] },
  
  // Navigation shortcuts
  { id: 'graph-view', action: 'Graph View', category: 'navigation', keys: ['G'] },
  { id: 'close-overlay', action: 'Close Overlay', category: 'navigation', keys: ['Esc'] },
  
  // Editor shortcuts
  { id: 'bold', action: 'Bold', category: 'editor', keys: ['Ctrl', 'B'] },
  { id: 'italic', action: 'Italic', category: 'editor', keys: ['Ctrl', 'I'] },
  { id: 'heading', action: 'Heading', category: 'editor', keys: ['Ctrl', 'Shift', 'H'] },
  { id: 'wikilink', action: 'Wikilink', category: 'editor', keys: ['[', '['] },
];

/**
 * Get display keys for the current platform.
 * Replaces 'Ctrl' → '⌘' and 'Shift' → '⇧' on macOS.
 */
export function getDisplayKeys(shortcut: ShortcutDefinition): string[] {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  
  if (!isMac) {
    return shortcut.keys;
  }
  
  return shortcut.keys.map(key => {
    if (key === 'Ctrl') return '⌘';
    if (key === 'Shift') return '⇧';
    return key;
  });
}

/**
 * Group shortcuts by category.
 */
export function getShortcutsByCategory(): Record<ShortcutCategory, ShortcutDefinition[]> {
  const result: Record<ShortcutCategory, ShortcutDefinition[]> = {
    global: [],
    navigation: [],
    editor: [],
  };
  
  for (const shortcut of SHORTCUT_DEFINITIONS) {
    result[shortcut.category].push(shortcut);
  }
  
  return result;
}
