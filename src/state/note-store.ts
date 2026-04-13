import { create } from 'zustand';
import type { NoteRecord, ParaCategory } from '../core/note/note';
import { noteRepository } from '../storage/note-repository';

interface NoteState {
  notes: NoteRecord[];
  activeNoteId: string | null;
  isLoading: boolean;
  selectedParaCategory: ParaCategory | 'all' | null;
  searchQuery: string;
  lastDeletedNote: NoteRecord | null;

  // Actions
  loadNotes: () => Promise<void>;
  selectNote: (id: string | null) => void;
  createNote: (title: string, paraCategory: ParaCategory) => Promise<NoteRecord>;
  updateNote: (id: string, updates: Partial<NoteRecord>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  addTag: (id: string, tag: string) => Promise<void>;
  removeTag: (id: string, tag: string) => Promise<void>;
  setParaCategory: (category: ParaCategory | 'all' | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  activeNoteId: null,
  isLoading: false,
  selectedParaCategory: 'all',
  searchQuery: '',
  lastDeletedNote: null,

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const notes = await noteRepository.getAll();
      set({ notes: notes.reverse() });
    } finally {
      set({ isLoading: false });
    }
  },

  selectNote: (id) => set({ activeNoteId: id }),

  createNote: async (title, paraCategory) => {
    const note = await noteRepository.create({
      id: crypto.randomUUID(),
      title,
      content: '',
      paraCategory,
      tags: [],
      isDeleted: false,
    });
    set((state) => ({
      notes: [note, ...state.notes],
      activeNoteId: note.id,
    }));
    return note;
  },

  updateNote: async (id, updates) => {
    await noteRepository.update(id, updates);
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)),
    }));
  },

  deleteNote: async (id) => {
    const note = useNoteStore.getState().notes.find((n) => n.id === id);
    await noteRepository.delete(id);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
      lastDeletedNote: note || null,
    }));
  },

  undoDelete: async () => {
    const note = useNoteStore.getState().lastDeletedNote;
    if (!note) return;
    await noteRepository.update(note.id, { isDeleted: false });
    set((state) => ({
      notes: [note, ...state.notes],
      lastDeletedNote: null,
    }));
  },

  addTag: async (id: string, tag: string) => {
    const note = useNoteStore.getState().notes.find((n) => n.id === id);
    if (!note || note.tags.includes(tag)) return;
    const newTags = [...note.tags, tag];
    await noteRepository.update(id, { tags: newTags });
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, tags: newTags } : n)),
    }));
  },

  removeTag: async (id: string, tag: string) => {
    const note = useNoteStore.getState().notes.find((n) => n.id === id);
    if (!note) return;
    const newTags = note.tags.filter((t) => t !== tag);
    await noteRepository.update(id, { tags: newTags });
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, tags: newTags } : n)),
    }));
  },

  setParaCategory: (category) => set({ selectedParaCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
