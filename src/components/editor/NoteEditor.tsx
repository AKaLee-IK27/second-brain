import { useEffect, useState, useCallback } from 'react';
import { EditorContent } from '@tiptap/react';
import { useNoteStore } from '../../state/note-store';
import { useNoteEditor } from '../../editor/editor-config';
import WikilinkSuggestion from './WikilinkSuggestion';

interface NoteEditorProps {
  onContentUpdate: (content: string) => void;
  onTitleUpdate: (title: string) => void;
  onWikilinkClick: (linkText: string) => void;
}

function NoteEditor({ onContentUpdate, onTitleUpdate, onWikilinkClick }: NoteEditorProps) {
  const { activeNoteId, notes, addTag, removeTag } = useNoteStore();
  const [showWikilinkSuggestion, setShowWikilinkSuggestion] = useState(false);
  const [wikilinkQuery, setWikilinkQuery] = useState('');
  const [tagInput, setTagInput] = useState('');

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && activeNoteId) {
      const note = notes.find((n) => n.id === activeNoteId);
      if (note && !note.tags.includes(tag)) {
        addTag(activeNoteId, tag);
        setTagInput('');
      }
    }
  }, [tagInput, activeNoteId, notes, addTag]);

  const editor = useNoteEditor({
    content: activeNote?.content ?? '',
    onUpdate: (content) => {
      onContentUpdate(content);
    },
    onWikilinkClick: onWikilinkClick,
    placeholder: 'Start writing... Use [[ to link notes',
  });

  // Sync editor content when active note changes
  useEffect(() => {
    if (editor && activeNote) {
      const currentContent = editor.getHTML();
      if (currentContent !== activeNote.content) {
        editor.commands.setContent(activeNote.content);
      }
    }
  }, [activeNoteId, editor]);

  // Handle wikilink suggestion trigger
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '[' && editor.state.selection.$head.parent.textContent.endsWith('[')) {
        const text = editor.state.selection.$head.parent.textContent;
        if (text.endsWith('[[')) {
          setShowWikilinkSuggestion(true);
          setWikilinkQuery('');
        }
      }
    };

    editor.view.dom.addEventListener('keydown', handleKeyDown);
    return () => editor.view.dom.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  const handleWikilinkSelect = useCallback(
    (noteTitle: string) => {
      if (editor) {
        // Remove the [[ and query text
        const pos = editor.state.selection.$head.pos;
        const text = editor.state.doc.textBetween(Math.max(0, pos - 50), pos);
        const match = text.match(/\[\[([^\]]*)$/);
        if (match) {
          editor
            .chain()
            .focus()
            .deleteRange({ from: pos - match[0].length, to: pos })
            .insertWikilink(noteTitle)
            .run();
        }
      }
      setShowWikilinkSuggestion(false);
      setWikilinkQuery('');
    },
    [editor]
  );

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-sb-surface-alt">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="font-display font-semibold text-xl mb-2 text-sb-text">No note selected</h2>
          <p className="text-sb-text-muted">Select a note from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-sb-surface">
      {/* Title Input */}
      <div className="px-8 pt-6 pb-2 border-b border-sb-border">
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => onTitleUpdate(e.target.value)}
          className="w-full text-2xl font-display font-bold bg-transparent border-none outline-none placeholder-sb-text-muted text-sb-text"
          placeholder="Note title..."
        />
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="sb-tag sb-tag-projects">
            {activeNote.paraCategory.toUpperCase()}
          </span>
          {activeNote.tags.map((tag) => (
            <span key={tag} className="sb-tag flex items-center gap-1">
              #{tag}
              <button
                onClick={() => removeTag(activeNote.id, tag)}
                className="text-sb-text-muted hover:text-sb-red text-xs leading-none transition-colors"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="+ tag"
            className="text-xs bg-transparent border-none outline-none placeholder-sb-text-muted w-16 font-display text-sb-text"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div className="max-w-3xl mx-auto">
          {editor && <EditorContent editor={editor} />}
        </div>
      </div>

      {/* Wikilink Suggestion */}
      {showWikilinkSuggestion && (
        <WikilinkSuggestion
          query={wikilinkQuery}
          onSelect={handleWikilinkSelect}
          onClose={() => setShowWikilinkSuggestion(false)}
        />
      )}
    </div>
  );
}

export default NoteEditor;
