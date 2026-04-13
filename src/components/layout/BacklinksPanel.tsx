import { useState, useEffect, useMemo } from 'react';
import { useNoteStore } from '../../state/note-store';
import { linkRepository } from '../../storage/link-repository';
import type { LinkRecord, NoteRecord } from '../../core/note/note';
import { Icon } from '../shared/Icon';

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
        <p className="text-sb-text-muted text-sm font-display">Select a note to see backlinks</p>
      </div>
    );
  }

  if (backlinkNotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sb-text-muted text-sm font-display">No backlinks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-display font-semibold text-sm mb-2 text-sb-text">
        <Icon name="Link" size={14} ariaHidden /> {backlinkNotes.length} Backlink{backlinkNotes.length !== 1 ? 's' : ''}
      </h4>
      {backlinkNotes.map((note) => (
        <button
          key={note.id}
          onClick={() => selectNote(note.id)}
          className="w-full text-left sb-card p-3 hover:bg-sb-yellow-tint transition-all"
        >
          <div className="font-display font-medium text-sm mb-1 text-sb-text">{note.title}</div>
          <div className="text-xs text-sb-text-secondary line-clamp-2">
            {note.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
          </div>
        </button>
      ))}
    </div>
  );
}

export default BacklinksPanel;
