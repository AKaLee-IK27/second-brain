import { useState, useEffect, useMemo } from 'react';
import { useNoteStore } from '../../state/note-store';
import { linkRepository } from '../../storage/link-repository';
import { format } from 'date-fns';
import { MaterialIcon } from '../shared/MaterialIcon';

function NoteInfoPanel() {
  const { activeNoteId, notes, deleteNote, removeTag } = useNoteStore();
  const [backlinkCount, setBacklinkCount] = useState(0);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId) ?? null,
    [notes, activeNoteId]
  );

  useEffect(() => {
    if (activeNoteId) {
      linkRepository.getBacklinks(activeNoteId).then((links) => {
        setBacklinkCount(links.length);
      });
    }
  }, [activeNoteId]);

  if (!activeNote) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-outline-variant text-sm font-headline">Select a note to see info</p>
      </div>
    );
  }

  const wordCount = activeNote.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const linkCount = activeNote.content.match(/\[\[([^\]]+)\]\]/g)?.length ?? 0;

  const paraColors: Record<string, string> = {
    projects: 'bg-sb-projects text-sb-projects-text',
    areas: 'bg-sb-areas text-sb-areas-text',
    resources: 'bg-sb-resources text-sb-resources-text',
    archives: 'bg-sb-archive text-sb-archive-text',
  };

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="bg-surface-container rounded-lg p-4">
        <h4 className="font-mono font-semibold text-xs mb-1 text-outline-variant uppercase tracking-wider">Title</h4>
        <p className="text-sm text-on-surface truncate">{activeNote.title || 'Untitled'}</p>
      </div>

      {/* Category */}
      <div className="bg-surface-container rounded-lg p-4">
        <h4 className="font-mono font-semibold text-xs mb-2 text-outline-variant uppercase tracking-wider">Category</h4>
        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${paraColors[activeNote.paraCategory] || 'bg-surface-container-high text-on-surface-variant'}`}>
          {activeNote.paraCategory.toUpperCase()}
        </span>
      </div>

      {/* Stats */}
      <div className="bg-surface-container rounded-lg p-4">
        <h4 className="font-mono font-semibold text-xs mb-2 text-outline-variant uppercase tracking-wider">Stats</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container-high rounded-sm p-2 text-center">
            <div className="text-lg font-semibold font-headline text-on-surface">{wordCount}</div>
            <div className="text-xs text-outline-variant">Words</div>
          </div>
          <div className="bg-surface-container-high rounded-sm p-2 text-center">
            <div className="text-lg font-semibold font-headline text-on-surface">{linkCount}</div>
            <div className="text-xs text-outline-variant">Links</div>
          </div>
          <div className="bg-surface-container-high rounded-sm p-2 text-center">
            <div className="text-lg font-semibold font-headline text-on-surface">{backlinkCount}</div>
            <div className="text-xs text-outline-variant">Backlinks</div>
          </div>
          <div className="bg-surface-container-high rounded-sm p-2 text-center">
            <div className="text-lg font-semibold font-headline text-on-surface">{activeNote.tags.length}</div>
            <div className="text-xs text-outline-variant">Tags</div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {activeNote.tags.length > 0 && (
        <div className="bg-surface-container rounded-lg p-4">
          <h4 className="font-mono font-semibold text-xs mb-2 text-outline-variant uppercase tracking-wider">Tags</h4>
          <div className="flex flex-wrap gap-1.5">
            {activeNote.tags.map((tag) => (
              <span
                key={tag}
                className="sb-tag flex items-center gap-1"
              >
                #{tag}
                <button
                  onClick={() => removeTag(activeNote.id, tag)}
                  className="text-outline-variant hover:text-error text-xs leading-none transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="bg-surface-container rounded-lg p-4">
        <h4 className="font-mono font-semibold text-xs mb-2 text-outline-variant uppercase tracking-wider">Dates</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-outline-variant">Created</span>
            <span className="font-mono text-on-surface">{format(activeNote.createdAt, 'MMM d, yyyy HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-outline-variant">Modified</span>
            <span className="font-mono text-on-surface">{format(activeNote.updatedAt, 'MMM d, yyyy HH:mm')}</span>
          </div>
        </div>
      </div>

      {/* Delete */}
      <div className="bg-surface-container rounded-lg p-4 border border-error/20">
        <button
          onClick={() => {
            if (window.confirm(`Delete "${activeNote.title}"?`)) {
              deleteNote(activeNote.id);
            }
          }}
          className="w-full text-left text-sm font-headline font-medium text-error hover:bg-error/10 transition-all px-2 py-1.5 rounded-sm flex items-center gap-2"
        >
          <MaterialIcon name="delete" size={14} /> Delete Note
        </button>
      </div>
    </div>
  );
}

export default NoteInfoPanel;
