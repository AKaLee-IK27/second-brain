import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Wikilink } from './extensions/wikilink';

interface UseNoteEditorProps {
  content: string;
  onUpdate?: (content: string) => void;
  onWikilinkClick?: (linkText: string) => void;
  placeholder?: string;
}

export function useNoteEditor({ content, onUpdate, onWikilinkClick, placeholder }: UseNoteEditorProps) {
  return useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing... Use [[ to link notes',
      }),
      Wikilink.configure({
        onClick: onWikilinkClick,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
  });
}
