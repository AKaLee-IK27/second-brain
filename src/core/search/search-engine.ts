import Fuse from 'fuse.js';
import type { NoteRecord } from '../note/note';

export interface SearchResult {
  noteId: string;
  title: string;
  content: string;
  paraCategory: string;
  score: number;
  tags: string[];
}

export class SearchEngine {
  private fuse: Fuse<NoteRecord> | null = null;

  indexNotes(notes: NoteRecord[]) {
    this.fuse = new Fuse(notes, {
      keys: [
        { name: 'title', weight: 0.6 },
        { name: 'content', weight: 0.3 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
    });
  }

  search(query: string): SearchResult[] {
    if (!query.trim() || !this.fuse) return [];
    const results = this.fuse.search(query);
    return results.map((r) => ({
      noteId: r.item.id,
      title: r.item.title,
      content: r.item.content,
      paraCategory: r.item.paraCategory,
      score: r.score ?? 1,
      tags: r.item.tags,
    }));
  }
}

export const searchEngine = new SearchEngine();
