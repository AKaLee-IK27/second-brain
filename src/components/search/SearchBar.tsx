import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '../../services/api';
import type { SearchResult } from '../../types/search';
import { MaterialIcon } from '../shared/MaterialIcon';

const typeColors: Record<string, string> = {
  session: 'text-primary',
  agent: 'text-tertiary',
  skill: 'text-secondary',
  topic: 'text-sb-purple',
  config: 'text-outline-variant',
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 200);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    api.search
      .query({ query: debouncedQuery, limit: 10 })
      .then((data) => {
        setResults(data.results);
        setActiveIndex(0);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      setIsOpen(false);
      setQuery('');
      const slug = item.slug || item.id;
      const routes: Record<string, string> = {
        session: `/sessions/${item.id}`,
        agent: `/agents/${slug}`,
        skill: `/skills/${slug}`,
        topic: `/topics/${slug}`,
        config: `/configs/${slug}`,
      };
      if (routes[item.type]) navigate(routes[item.type]);
    },
    [navigate],
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && results[activeIndex]) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, results, activeIndex, handleSelect]);

  return (
    <div className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">
          <MaterialIcon name="search" size={16} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search..."
          className="sb-input pl-9 pr-16 text-sm w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg focus:border-primary/50"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-outline-variant bg-surface-container-high border border-outline-variant/30 rounded px-1.5 py-0.5 font-mono">
          ⌘K
        </kbd>
      </div>

      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-highest border border-outline-variant/15 rounded-lg z-50 max-h-80 overflow-y-auto shadow-sb-xl">
          {loading && (
            <div className="p-4 text-center text-outline-variant text-sm font-mono">
              Searching...
            </div>
          )}
          {error && !loading && (
            <div className="p-4 text-center text-error text-sm font-mono">
              {error}
            </div>
          )}
          {!loading && !error && results.length === 0 && query.trim() && (
            <div className="p-4 text-center text-outline-variant text-sm font-mono">
              No results found
            </div>
          )}
          {!loading &&
            results.map((item, i) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-4 py-2.5 border-b border-outline-variant/10 last:border-b-0 transition-colors ${
                  i === activeIndex
                    ? 'bg-primary/10 border-l-2 border-primary'
                    : 'hover:bg-surface-container-high'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MaterialIcon name={
                    item.type === 'session' ? 'history' :
                    item.type === 'agent' ? 'smart_toy' :
                    item.type === 'skill' ? 'terminal' :
                    item.type === 'topic' ? 'topic' :
                    'settings_input_component'
                  } size={14} className={typeColors[item.type] || 'text-outline-variant'} />
                  <span className={`text-xs font-medium capitalize font-mono ${typeColors[item.type] || 'text-outline-variant'}`}>
                    {item.type}
                  </span>
                  <span className="text-sm text-on-surface truncate flex-1 font-headline">
                    {item.title}
                  </span>
                </div>
                {item.category && (
                  <div className="text-xs text-outline-variant mt-0.5 ml-6 capitalize font-mono">
                    {item.category}
                  </div>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
