import { useMemo } from 'react';
import { useNoteStore } from '../state/note-store';

export interface OutlineItem {
  id: string;
  text: string;
  level: number;
}

export function useOutline(): OutlineItem[] {
  const { activeNoteId, notes } = useNoteStore();

  return useMemo(() => {
    const note = notes.find((n) => n.id === activeNoteId);
    if (!note?.content) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(note.content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3');

    return Array.from(headings).map((h, index) => ({
      id: `heading-${index}`,
      text: h.textContent || '',
      level: parseInt(h.tagName.charAt(1)),
    }));
  }, [activeNoteId, notes]);
}
