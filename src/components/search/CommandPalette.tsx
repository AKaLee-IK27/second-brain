import { useState, useEffect, useMemo, useRef } from 'react';
import { useNoteStore } from '../../state/note-store';
import { useUIStore } from '../../state/ui-store';
import { searchEngine } from '../../core/search/search-engine';
import type { SearchResult } from '../../core/search/search-engine';
import { MaterialIcon } from '../shared/MaterialIcon';
import { SHORTCUT_DEFINITIONS, getDisplayKeys } from '../../config/shortcuts-definitions';

const paraColors: Record<string, string> = {
  projects: 'text-sb-projects',
  areas: 'text-sb-areas',
  resources: 'text-sb-resources',
  archives: 'text-sb-archive',
};

// Helper to get shortcut display string for a given shortcut ID
function getShortcutDisplay(id: string): string {
  const shortcut = SHORTCUT_DEFINITIONS.find(s => s.id === id);
  if (!shortcut) return '';
  return getDisplayKeys(shortcut).join('+');
}

function CommandPalette() {
  const { notes, selectNote, createNote, activeNoteId } = useNoteStore();
  const { setCommandPaletteOpen, toggleSidebar, toggleRightPanel, toggleFocusMode, toggleShortcutHelp } = useUIStore();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'new-note', label: 'New Note', shortcut: getShortcutDisplay('new-note'), action: () => createNote('Untitled Note', 'projects') },
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', shortcut: getShortcutDisplay('toggle-sidebar'), action: toggleSidebar },
    { id: 'toggle-right', label: 'Toggle Right Panel', shortcut: getShortcutDisplay('toggle-right-panel'), action: toggleRightPanel },
    { id: 'focus-mode', label: 'Toggle Focus Mode', shortcut: getShortcutDisplay('focus-mode'), action: toggleFocusMode },
    { id: 'shortcuts', label: 'Show Keyboard Shortcuts', shortcut: getShortcutDisplay('show-shortcuts'), action: toggleShortcutHelp },
  ];

  const searchResults: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];
    return searchEngine.search(query);
  }, [query]);

  const recentNotes = useMemo(() => {
    return notes.filter((n) => n.id !== activeNoteId).slice(0, 5);
  }, [notes, activeNoteId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const maxIndex = (query.trim() ? searchResults.length : recentNotes.length) + commands.length - 1;
        setActiveIndex((prev) => Math.min(prev + 1, maxIndex));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(activeIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, query, searchResults, recentNotes, commands]);

  const handleSelect = (index: number) => {
    const items = query.trim()
      ? [...commands, ...searchResults.map((r) => ({ id: r.noteId, label: r.title, type: 'note' as const }))]
      : [...commands, ...recentNotes.map((n) => ({ id: n.id, label: n.title, type: 'note' as const }))];

    const item = items[index];
    if (!item) return;

    if ('type' in item && item.type === 'note') {
      selectNote(item.id);
    } else {
      const cmd = commands.find((c) => c.id === item.id);
      cmd?.action();
    }
    setCommandPaletteOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setCommandPaletteOpen(false);
    }
  };

  const allItems = query.trim()
    ? [...commands, ...searchResults.map((r) => ({ id: r.noteId, label: r.title, type: 'note' as const, paraCategory: r.paraCategory }))]
    : [...commands, ...recentNotes.map((n) => ({ id: n.id, label: n.title, type: 'note' as const, paraCategory: n.paraCategory }))];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 z-50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl bg-surface-container/90 backdrop-blur-xl border border-outline-variant/20 rounded-xl overflow-hidden shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center px-6 py-5 border-b border-outline-variant/15">
          <span className="font-mono text-primary mr-4 text-lg select-none">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search knowledge or run commands..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-headline placeholder:text-outline/50 text-lg"
          />
          <div className="flex items-center gap-2 ml-4">
            <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 font-mono text-[10px] text-outline-variant">ESC</span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {!query.trim() && (
            <div className="px-3 py-2">
              <div className="px-3 py-1 font-mono text-[10px] text-outline-variant uppercase tracking-widest mb-1">Recent</div>
            </div>
          )}

          {/* Commands Section */}
          <div className="px-3 py-2">
            <div className="px-3 py-1 font-mono text-[10px] text-outline-variant uppercase tracking-widest mb-1">Commands</div>
            <div className="space-y-1">
              {commands.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(i)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-colors duration-150 flex items-center justify-between ${
                    i === activeIndex
                      ? 'bg-primary/10 border-l-2 border-primary'
                      : 'hover:bg-surface-container-highest'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MaterialIcon name="bolt" size={18} className="text-secondary" />
                    <span className="font-headline text-on-surface-variant hover:text-on-surface font-medium">{cmd.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-outline-variant bg-surface-container-highest border border-outline-variant/30 rounded px-1.5 py-0.5">
                    {cmd.shortcut}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          {allItems.length > commands.length && (
            <div className="px-3 py-2">
              <div className="px-3 py-1 font-mono text-[10px] text-outline-variant uppercase tracking-widest mb-1">Notes & Research</div>
              <div className="space-y-1">
                {allItems.slice(commands.length).map((item, i) => {
                  const globalIndex = commands.length + i;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(globalIndex)}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-colors duration-150 flex items-center justify-between ${
                        globalIndex === activeIndex
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : 'hover:bg-surface-container-highest'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MaterialIcon name="description" size={18} className="text-outline-variant" />
                        <div className="flex flex-col">
                          <span className="font-headline text-on-surface-variant hover:text-on-surface font-medium">{item.label}</span>
                          {'paraCategory' in item && item.paraCategory && (
                            <span className={`font-serif text-[11px] ${paraColors[item.paraCategory as string] || 'text-outline-variant'}`}>
                              {item.paraCategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {allItems.length === 0 && (
            <div className="px-4 py-8 text-center text-outline-variant font-mono text-sm">
              No results found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface-container-lowest border-t border-outline-variant/15 font-mono text-[10px] text-outline-variant">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <MaterialIcon name="keyboard_arrow_up" size={14} />
              <MaterialIcon name="keyboard_arrow_down" size={14} />
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MaterialIcon name="keyboard_return" size={14} />
              <span>Open</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MaterialIcon name="search" size={14} />
            <span>{allItems.length} Results Found</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
