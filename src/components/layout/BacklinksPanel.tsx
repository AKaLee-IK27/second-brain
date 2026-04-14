import { useState, useEffect, useMemo } from 'react';
import { useNoteStore } from '../../state/note-store';
import { linkRepository } from '../../storage/link-repository';
import type { LinkRecord, NoteRecord } from '../../core/note/note';
import { MaterialIcon } from '../shared/MaterialIcon';

function BacklinksPanel() {
  const { activeNoteId, notes, selectNote } = useNoteStore();
  const [backlinks, setBacklinks] = useState<LinkRecord[]>([]);

  const backlinkNotes = useMemo(() => {
    return backlinks
      .map((link) => notes.find((n) => n.id === link.fromNoteId))
      .filter((n): n is NoteRecord => n !== undefined);
  }, [backlinks, notes]);

  useEffect(() => {
    if (activeNoteId) {
      linkRepository.getBacklinks(activeNoteId).then(setBacklinks);
    }
  }, [activeNoteId]);

  if (!activeNoteId) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-outline-variant text-sm font-headline">Select a note to see backlinks</p>
      </div>
    );
  }

  if (backlinkNotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-outline-variant text-sm font-headline">No backlinks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-headline font-semibold text-sm mb-2 text-on-surface flex items-center gap-2">
        <MaterialIcon name="link" size={14} /> {backlinkNotes.length} Backlink{backlinkNotes.length !== 1 ? 's' : ''}
      </h4>
      {backlinkNotes.map((note) => (
        <button
          key={note.id}
          onClick={() => selectNote(note.id)}
          className="w-full text-left bg-surface-container rounded-lg p-3 hover:bg-surface-container-high transition-all border border-transparent hover:border-primary/20"
        >
          <div className="font-headline font-medium text-sm mb-1 text-on-surface">{note.title}</div>
          <div className="text-xs text-on-surface-variant line-clamp-2">
            {note.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
          </div>
        </button>
      ))}
    </div>
  );
}

export default BacklinksPanel;
