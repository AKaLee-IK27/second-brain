import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoteStore } from '../../state/note-store';
import { useUIStore } from '../../state/ui-store';
import { useDebounce } from '../../hooks/useDebounce';
import { searchEngine } from '../../core/search/search-engine';
import type { SearchResult as LocalSearchResult } from '../../core/search/search-engine';
import { api } from '../../services/api';
import type { SearchResult as ServerSearchResult } from '../../types/search';
import { MaterialIcon } from '../shared/MaterialIcon';
import { SHORTCUT_DEFINITIONS, getDisplayKeys } from '../../config/shortcuts-definitions';

const paraColors: Record<string, string> = {
  projects: 'text-sb-projects',
  areas: 'text-sb-areas',
  resources: 'text-sb-resources',
  archives: 'text-sb-archive',
};

const typeIcons: Record<string, string> = {
  session: 'history',
  agent: 'smart_toy',
  skill: 'terminal',
  topic: 'topic',
  config: 'settings_input_component',
};

const typeColors: Record<string, string> = {
  session: 'text-primary',
  agent: 'text-tertiary',
  skill: 'text-secondary',
  topic: 'text-sb-purple',
  config: 'text-outline-variant',
};

// Helper to get shortcut display string for a given shortcut ID
function getShortcutDisplay(id: string): string {
  const shortcut = SHORTCUT_DEFINITIONS.find(s => s.id === id);
  if (!shortcut) return '';
  return getDisplayKeys(shortcut).join('+');
}

type PaletteItem =
  | { section: 'commands'; id: string; label: string; shortcut: string; action: () => void }
  | { section: 'notes'; id: string; label: string; paraCategory?: string }
  | { section: 'sessions' | 'agents' | 'skills' | 'topics' | 'configs'; id: string; label: string; category?: string; slug?: string };

function CommandPalette() {
  const { notes, selectNote, createNote, activeNoteId } = useNoteStore();
  const { setCommandPaletteOpen, toggleSidebar, toggleRightPanel, toggleFocusMode, toggleShortcutHelp } = useUIStore();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [serverResults, setServerResults] = useState<ServerSearchResult[]>([]);
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 200);

  const commands = useMemo(() => [
    { id: 'new-note', label: '> New Note', shortcut: getShortcutDisplay('new-note'), action: () => createNote('Untitled Note', 'projects') },
    { id: 'toggle-sidebar', label: '> Toggle Sidebar', shortcut: getShortcutDisplay('toggle-sidebar'), action: toggleSidebar },
    { id: 'toggle-right', label: '> Toggle Right Panel', shortcut: getShortcutDisplay('toggle-right-panel'), action: toggleRightPanel },
    { id: 'focus-mode', label: '> Toggle Focus Mode', shortcut: getShortcutDisplay('focus-mode'), action: toggleFocusMode },
    { id: 'shortcuts', label: '> Show Keyboard Shortcuts', shortcut: getShortcutDisplay('show-shortcuts'), action: toggleShortcutHelp },
  ], [createNote, toggleSidebar, toggleRightPanel, toggleFocusMode, toggleShortcutHelp]);

  // Server-side search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setServerResults([]);
      setServerError(null);
      return;
    }
    setServerLoading(true);
    setServerError(null);
    api.search
      .query({ query: debouncedQuery, limit: 10 })
      .then((data) => {
        setServerResults(data.results);
      })
      .catch((err) => {
        setServerError(err instanceof Error ? err.message : 'Search failed');
      })
      .finally(() => setServerLoading(false));
  }, [debouncedQuery]);

  // Local search results
  const localResults: LocalSearchResult[] = useMemo(() => {
    if (!query.trim()) return [];
    return searchEngine.search(query);
  }, [query]);

  const recentNotes = useMemo(() => {
    return notes.filter((n) => n.id !== activeNoteId).slice(0, 5);
  }, [notes, activeNoteId]);

  // Build all items grouped by section
  const allItems: PaletteItem[] = useMemo(() => {
    const items: PaletteItem[] = commands.map(c => ({
      section: 'commands' as const,
      id: c.id,
      label: c.label,
      shortcut: c.shortcut,
      action: c.action,
    }));

    // Notes section
    if (!query.trim()) {
      items.push(...recentNotes.map(n => ({
        section: 'notes' as const,
        id: n.id,
        label: n.title,
        paraCategory: n.paraCategory,
      })));
    } else if (localResults.length > 0) {
      items.push(...localResults.map(r => ({
        section: 'notes' as const,
        id: r.noteId,
        label: r.title,
        paraCategory: r.paraCategory,
      })));
    }

    // Server results grouped by type
    if (query.trim() && serverResults.length > 0) {
      const grouped: Record<string, ServerSearchResult[]> = {};
      for (const r of serverResults) {
        if (!grouped[r.type]) grouped[r.type] = [];
        grouped[r.type].push(r);
      }
      const serverSectionTypes = ['sessions', 'agents', 'skills', 'topics', 'configs'] as const;
      for (const [type, results] of Object.entries(grouped)) {
        const section = serverSectionTypes.find(t => t === type);
        if (!section) continue;
        items.push(...results.map(r => ({
          section,
          id: r.id,
          label: r.title,
          category: r.category,
          slug: r.slug,
        })));
      }
    }

    return items;
  }, [commands, query, localResults, recentNotes, serverResults]);

  // Section headers for rendering
  const sections = useMemo(() => {
    const result: { header: string; items: PaletteItem[]; startIndex: number }[] = [];
    let currentIndex = 0;

    // Commands always shown
    const commandItems = allItems.filter(i => i.section === 'commands');
    if (commandItems.length > 0) {
      result.push({ header: 'Commands', items: commandItems, startIndex: currentIndex });
      currentIndex += commandItems.length;
    }

    // Notes
    const noteItems = allItems.filter(i => i.section === 'notes');
    if (noteItems.length > 0) {
      result.push({ header: query.trim() ? 'Notes & Research' : 'Recent', items: noteItems, startIndex: currentIndex });
      currentIndex += noteItems.length;
    }

    // Server types
    const serverTypes: PaletteItem['section'][] = ['sessions', 'agents', 'skills', 'topics', 'configs'];
    for (const type of serverTypes) {
      const typeItems = allItems.filter(i => i.section === type);
      if (typeItems.length > 0) {
        result.push({ header: type.charAt(0).toUpperCase() + type.slice(1), items: typeItems, startIndex: currentIndex });
        currentIndex += typeItems.length;
      }
    }

    return result;
  }, [allItems, query]);

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
        setActiveIndex((prev) => Math.min(prev + 1, allItems.length - 1));
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
  }, [activeIndex, allItems, setCommandPaletteOpen]);

  const handleSelect = useCallback((index: number) => {
    const item = allItems[index];
    if (!item) return;

    if (item.section === 'commands') {
      item.action();
    } else if (item.section === 'notes') {
      selectNote(item.id);
    } else {
      // Server content routing
      const slug = item.slug || item.id;
      const routes: Record<string, string> = {
        sessions: `/sessions/${item.id}`,
        agents: `/agents/${slug}`,
        skills: `/skills/${slug}`,
        topics: `/topics/${slug}`,
        configs: `/configs/${slug}`,
      };
      if (routes[item.section]) navigate(routes[item.section]);
    }
    setCommandPaletteOpen(false);
  }, [allItems, selectNote, navigate, setCommandPaletteOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setCommandPaletteOpen(false);
    }
  };

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
          {/* Loading state */}
          {serverLoading && (
            <div className="px-4 py-3 text-center text-outline-variant font-mono text-sm">
              Searching...
            </div>
          )}

          {/* Error state */}
          {serverError && !serverLoading && (
            <div className="px-4 py-3 text-center text-error font-mono text-sm">
              {serverError}
            </div>
          )}

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.header} className="px-3 py-2">
              <div className="px-3 py-1 font-mono text-[10px] text-outline-variant uppercase tracking-widest mb-1">
                {section.header}
              </div>
              <div className="space-y-1">
                {section.items.map((item, i) => {
                  const globalIndex = section.startIndex + i;
                  const isCommand = item.section === 'commands';

                  return (
                    <button
                      key={`${item.section}-${item.id}`}
                      onClick={() => handleSelect(globalIndex)}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-colors duration-150 flex items-center justify-between ${
                        globalIndex === activeIndex
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : 'hover:bg-surface-container-highest'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isCommand ? (
                          <MaterialIcon name="bolt" size={18} className="text-secondary" />
                        ) : item.section === 'notes' ? (
                          <MaterialIcon name="description" size={18} className="text-outline-variant" />
                        ) : (
                          <MaterialIcon
                            name={typeIcons[item.section] || 'description'}
                            size={18}
                            className={typeColors[item.section] || 'text-outline-variant'}
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="font-headline text-on-surface-variant hover:text-on-surface font-medium">
                            {item.label}
                          </span>
                          {'paraCategory' in item && item.paraCategory && (
                            <span className={`font-serif text-[11px] ${paraColors[item.paraCategory as string] || 'text-outline-variant'}`}>
                              {item.paraCategory}
                            </span>
                          )}
                          {'category' in item && item.category && (
                            <span className="font-mono text-[11px] text-outline-variant capitalize">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                      {isCommand && 'shortcut' in item && item.shortcut && (
                        <span className="font-mono text-[10px] text-outline-variant bg-surface-container-highest border border-outline-variant/30 rounded px-1.5 py-0.5">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {!serverLoading && !serverError && allItems.length === commands.length && query.trim() && (
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
            <span>{allItems.length - commands.length} Results Found</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
