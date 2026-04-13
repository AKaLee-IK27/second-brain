import { useState, useEffect, useMemo, useRef } from 'react';
import { useNoteStore } from '../../state/note-store';
import { useUIStore } from '../../state/ui-store';
import { searchEngine } from '../../core/search/search-engine';
import type { SearchResult } from '../../core/search/search-engine';
import { Icon } from '../shared/Icon';

function CommandPalette() {
  const { notes, selectNote, createNote, activeNoteId } = useNoteStore();
  const { setCommandPaletteOpen, toggleSidebar, toggleRightPanel, toggleFocusMode, toggleShortcutHelp } = useUIStore();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'new-note', label: 'New Note', shortcut: 'Ctrl+N', action: () => createNote('Untitled Note', 'projects') },
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', shortcut: 'Ctrl+\\', action: toggleSidebar },
    { id: 'toggle-right', label: 'Toggle Right Panel', shortcut: 'Ctrl+/', action: toggleRightPanel },
    { id: 'focus-mode', label: 'Toggle Focus Mode', shortcut: 'Ctrl+.', action: toggleFocusMode },
    { id: 'shortcuts', label: 'Show Keyboard Shortcuts', shortcut: 'Ctrl+?', action: toggleShortcutHelp },
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
      <div className="w-full max-w-lg sb-card overflow-hidden bg-sb-surface shadow-sb-xl">
        {/* Search Input */}
        <div className="p-4 border-b border-sb-border">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            className="sb-input w-full text-base"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!query.trim() && (
            <div className="px-4 py-2 bg-sb-surface-alt border-b border-sb-border">
              <span className="text-xs font-display font-semibold text-sb-text-muted uppercase">Recent</span>
            </div>
          )}

          {allItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleSelect(index)}
              className={`w-full text-left px-4 py-3 border-b border-sb-border last:border-b-0 transition-colors ${
                index === activeIndex ? 'bg-sb-yellow-tint' : 'bg-sb-surface hover:bg-sb-surface-alt'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-medium text-sm text-sb-text">
                  {'type' in item && item.type === 'note'
                    ? <><Icon name="FileText" size={14} ariaHidden /> </>
                    : <><Icon name="Zap" size={14} ariaHidden /> </>}
                  {item.label}
                </span>
                {'shortcut' in item && (
                  <span className="text-xs font-mono text-sb-text-muted bg-sb-surface-alt border border-sb-border rounded-sm px-2 py-0.5">
                    {item.shortcut}
                  </span>
                )}
              </div>
              {'paraCategory' in item && item.paraCategory && (
                <span className="text-xs text-sb-text-muted mt-1 block">
                  {item.paraCategory}
                </span>
              )}
            </button>
          ))}

          {allItems.length === 0 && (
            <div className="px-4 py-8 text-center text-sb-text-muted">
              No results found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-sb-surface-alt border-t border-sb-border flex items-center justify-between text-xs text-sb-text-muted">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
