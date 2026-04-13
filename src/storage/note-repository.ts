import { db } from './db';
import type { NoteRecord, ParaCategory } from '../core/note/note';

export class NoteRepository {
  async create(note: Omit<NoteRecord, 'createdAt' | 'updatedAt'>): Promise<NoteRecord> {
    const now = Date.now();
    const record: NoteRecord = {
      ...note,
      createdAt: now,
      updatedAt: now,
    };
    await db.notes.add(record);
    return record;
  }

  async getById(id: string): Promise<NoteRecord | null> {
    const note = await db.notes.get(id);
    return note ?? null;
  }

  async getAll(): Promise<NoteRecord[]> {
    return db.notes.filter(n => !n.isDeleted).sortBy('updatedAt');
  }

  async getRecent(limit: number = 10): Promise<NoteRecord[]> {
    return db.notes
      .filter(n => !n.isDeleted)
      .sortBy('updatedAt')
      .then(notes => notes.reverse().slice(0, limit));
  }

  async getByParaCategory(category: ParaCategory): Promise<NoteRecord[]> {
    return db.notes
      .where('paraCategory').equals(category)
      .and(n => !n.isDeleted)
      .sortBy('updatedAt');
  }

  async update(id: string, updates: Partial<NoteRecord>): Promise<void> {
    await db.notes.update(id, { ...updates, updatedAt: Date.now() });
  }

  async delete(id: string): Promise<void> {
    await db.notes.update(id, { isDeleted: true, updatedAt: Date.now() });
  }

  async permanentDelete(id: string): Promise<void> {
    await db.notes.delete(id);
  }

  async searchByTitle(query: string): Promise<NoteRecord[]> {
    const lowerQuery = query.toLowerCase();
    return db.notes
      .filter(n => !n.isDeleted && n.title.toLowerCase().includes(lowerQuery))
      .sortBy('updatedAt');
  }
}

export const noteRepository = new NoteRepository();
