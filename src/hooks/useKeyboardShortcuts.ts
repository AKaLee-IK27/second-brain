import { useEffect } from 'react';
import { useNoteStore } from '../state/note-store';
import { useUIStore } from '../state/ui-store';

export function useKeyboardShortcuts() {
  const { createNote } = useNoteStore();
  const { toggleCommandPalette, toggleSidebar, toggleRightPanel, toggleFocusMode, toggleShortcutHelp, setCommandPaletteOpen, toggleGraphOverlay, setGraphOverlayOpen } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }

      if (mod && e.key === 'n') {
        e.preventDefault();
        createNote('Untitled Note', 'projects');
      }

      if (mod && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }

      if (mod && e.key === '/') {
        e.preventDefault();
        toggleRightPanel();
      }

      if (mod && e.key === '.') {
        e.preventDefault();
        toggleFocusMode();
      }

      if (mod && e.shiftKey && e.key === '?') {
        e.preventDefault();
        toggleShortcutHelp();
      }

      // Graph View toggle (G key, only when not typing)
      if (e.key === 'g' && !mod && !e.shiftKey) {
        const tag = (e.target as HTMLElement).tagName;
        const isContentEditable = (e.target as HTMLElement).isContentEditable;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !isContentEditable) {
          e.preventDefault();
          toggleGraphOverlay();
        }
      }

      if (e.key === 'Escape') {
        if (useUIStore.getState().commandPaletteOpen) {
          setCommandPaletteOpen(false);
        }
        if (useUIStore.getState().shortcutHelpOpen) {
          toggleShortcutHelp();
        }
        if (useUIStore.getState().graphOverlayOpen) {
          setGraphOverlayOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNote, toggleCommandPalette, toggleSidebar, toggleRightPanel, toggleFocusMode, toggleShortcutHelp, setCommandPaletteOpen]);
}
