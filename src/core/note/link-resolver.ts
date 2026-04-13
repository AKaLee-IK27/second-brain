import type { NoteRecord } from './note';

export class LinkResolver {
  private index: Map<string, string> = new Map();

  buildIndex(notes: NoteRecord[]) {
    this.index.clear();
    for (const note of notes) {
      this.index.set(note.title.toLowerCase(), note.id);
      this.index.set(this.slugify(note.title), note.id);
    }
  }

  resolve(linkText: string): string | null {
    return this.index.get(linkText.toLowerCase()) ?? null;
  }

  suggest(query: string, notes: NoteRecord[], limit: number = 5): NoteRecord[] {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return notes
      .filter((n) => n.title.toLowerCase().includes(lowerQuery))
      .slice(0, limit);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

export const linkResolver = new LinkResolver();
