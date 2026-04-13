import { useState, useEffect, useMemo } from 'react';
import { useNoteStore } from '../../state/note-store';
import { linkResolver } from '../../core/note/link-resolver';

interface WikilinkSuggestionProps {
  query: string;
  onSelect: (noteTitle: string) => void;
  onClose: () => void;
}

function WikilinkSuggestion({ query, onSelect, onClose }: WikilinkSuggestionProps) {
  const { notes } = useNoteStore();
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(() => {
    return linkResolver.suggest(query, notes, 5);
  }, [query, notes]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && suggestions[activeIndex]) {
        e.preventDefault();
        onSelect(suggestions[activeIndex].title);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, activeIndex, onSelect, onClose]);

  if (suggestions.length === 0) {
    return (
      <div className="wikilink-suggestion absolute bottom-4 left-1/2 -translate-x-1/2 w-64">
        <div className="wikilink-suggestion-item text-sb-text-muted">
          No matching notes found
        </div>
      </div>
    );
  }

  return (
    <div className="wikilink-suggestion absolute bottom-4 left-1/2 -translate-x-1/2 w-64 z-50">
      {suggestions.map((note, index) => (
        <div
          key={note.id}
          className={`wikilink-suggestion-item ${index === activeIndex ? 'active' : ''}`}
          onClick={() => onSelect(note.title)}
        >
          <span className="font-display font-medium text-sb-text">{note.title}</span>
          <span className="text-xs text-sb-text-muted ml-2">
            {note.paraCategory}
          </span>
        </div>
      ))}
    </div>
  );
}

export default WikilinkSuggestion;
