import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '../../services/api';
import type { SearchResult } from '../../types/search';
import { Icon, type IconName } from '../shared/Icon';

const typeIcons: Record<string, IconName> = {
  session: 'MessageSquare',
  agent: 'Bot',
  skill: 'Wrench',
  topic: 'BookOpen',
  config: 'Settings',
};

const typeColors: Record<string, string> = {
  session: 'text-sb-accent',
  agent: 'text-sb-success',
  skill: 'text-sb-warning',
  topic: 'text-sb-purple',
  config: 'text-sb-text-muted',
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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sb-text-muted">
          <Icon name="Search" size={16} ariaHidden />
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
          className="sb-input pl-9 pr-16 text-sm w-64"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-sb-text-muted bg-sb-surface-alt border border-sb-border rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>

      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 sb-card bg-sb-surface z-50 max-h-80 overflow-y-auto shadow-sb-xl">
          {loading && (
            <div className="p-4 text-center text-sb-text-muted text-sm">
              Searching...
            </div>
          )}
          {error && !loading && (
            <div className="p-4 text-center text-sb-error text-sm">
              {error}
            </div>
          )}
          {!loading && !error && results.length === 0 && query.trim() && (
            <div className="p-4 text-center text-sb-text-muted text-sm">
              No results found
            </div>
          )}
          {!loading &&
            results.map((item, i) => {
              const icon = typeIcons[item.type];
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left px-4 py-2.5 border-b border-sb-border last:border-b-0 transition-colors ${
                    i === activeIndex
                      ? 'bg-sb-accent/10'
                      : 'hover:bg-sb-surface-alt'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {icon ? (
                      <Icon name={icon} size={14} ariaHidden />
                    ) : (
                      <Icon name="FileText" size={14} ariaHidden />
                    )}
                    <span
                      className={`text-xs font-medium capitalize ${
                        typeColors[item.type] || 'text-sb-text-secondary'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-sm text-sb-text truncate flex-1">
                      {item.title}
                    </span>
                  </div>
                  {item.category && (
                    <div className="text-xs text-sb-text-muted mt-0.5 ml-6 capitalize">
                      {item.category}
                    </div>
                  )}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
