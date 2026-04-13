import { useState, useEffect, useMemo } from 'react';
import { useNoteStore } from '../../state/note-store';
import { linkRepository } from '../../storage/link-repository';
import { format } from 'date-fns';
import { Icon } from '../shared/Icon';

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
        <p className="text-brut-text-muted text-sm font-display">Select a note to see info</p>
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
      <div className="sb-card p-4">
        <h4 className="font-display font-semibold text-xs mb-1 text-sb-text-muted uppercase tracking-wider">Title</h4>
        <p className="text-sm text-sb-text truncate">{activeNote.title || 'Untitled'}</p>
      </div>

      {/* Category */}
      <div className="sb-card p-4">
        <h4 className="font-display font-semibold text-xs mb-2 text-sb-text-muted uppercase tracking-wider">Category</h4>
        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${paraColors[activeNote.paraCategory] || 'bg-sb-surface-alt text-sb-text-secondary'}`}>
          {activeNote.paraCategory.toUpperCase()}
        </span>
      </div>

      {/* Stats */}
      <div className="sb-card p-4">
        <h4 className="font-display font-semibold text-xs mb-2 text-sb-text-muted uppercase tracking-wider">Stats</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-sb-surface-alt border border-sb-border rounded-sm p-2 text-center">
            <div className="text-lg font-semibold font-display text-sb-text">{wordCount}</div>
            <div className="text-xs text-sb-text-muted">Words</div>
          </div>
          <div className="bg-sb-surface-alt border border-sb-border rounded-sm p-2 text-center">
            <div className="text-lg font-semibold font-display text-sb-text">{linkCount}</div>
            <div className="text-xs text-sb-text-muted">Links</div>
          </div>
          <div className="bg-sb-surface-alt border border-sb-border rounded-sm p-2 text-center">
            <div className="text-lg font-semibold font-display text-sb-text">{backlinkCount}</div>
            <div className="text-xs text-sb-text-muted">Backlinks</div>
          </div>
          <div className="bg-sb-surface-alt border border-sb-border rounded-sm p-2 text-center">
            <div className="text-lg font-semibold font-display text-sb-text">{activeNote.tags.length}</div>
            <div className="text-xs text-sb-text-muted">Tags</div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {activeNote.tags.length > 0 && (
        <div className="sb-card p-4">
          <h4 className="font-display font-semibold text-xs mb-2 text-sb-text-muted uppercase tracking-wider">Tags</h4>
          <div className="flex flex-wrap gap-1.5">
            {activeNote.tags.map((tag) => (
              <span
                key={tag}
                className="sb-tag flex items-center gap-1"
              >
                #{tag}
                <button
                  onClick={() => removeTag(activeNote.id, tag)}
                  className="text-sb-text-muted hover:text-sb-red text-xs leading-none transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="sb-card p-4">
        <h4 className="font-display font-semibold text-xs mb-2 text-sb-text-muted uppercase tracking-wider">Dates</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-sb-text-muted">Created</span>
            <span className="font-mono text-sb-text">{format(activeNote.createdAt, 'MMM d, yyyy HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sb-text-muted">Modified</span>
            <span className="font-mono text-sb-text">{format(activeNote.updatedAt, 'MMM d, yyyy HH:mm')}</span>
          </div>
        </div>
      </div>

      {/* Delete */}
      <div className="sb-card p-4 border-red-200">
        <button
          onClick={() => {
            if (window.confirm(`Delete "${activeNote.title}"?`)) {
              deleteNote(activeNote.id);
            }
          }}
          className="w-full text-left text-sm font-display font-medium text-sb-red hover:bg-red-50 hover:text-red-700 transition-all px-2 py-1.5 rounded-sm"
        >
          <Icon name="Trash2" size={14} ariaHidden /> Delete Note
        </button>
      </div>
    </div>
  );
}

export default NoteInfoPanel;
