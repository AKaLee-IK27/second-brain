import { db } from './db';
import type { LinkRecord } from '../core/note/note';

export class LinkRepository {
  async add(link: LinkRecord): Promise<void> {
    await db.links.put(link);
  }

  async addMany(links: LinkRecord[]): Promise<void> {
    await db.links.bulkPut(links);
  }

  async clearAll(): Promise<void> {
    await db.links.clear();
  }

  async getBacklinks(noteId: string): Promise<LinkRecord[]> {
    return db.links.where('toNoteId').equals(noteId).toArray();
  }

  async getOutgoingLinks(noteId: string): Promise<LinkRecord[]> {
    return db.links.where('fromNoteId').equals(noteId).toArray();
  }

  async deleteByFromNoteId(noteId: string): Promise<void> {
    const links = await this.getOutgoingLinks(noteId);
    await db.links.bulkDelete(links.map(l => l.id));
  }

  async getAll(): Promise<LinkRecord[]> {
    return db.links.toArray();
  }
}

export const linkRepository = new LinkRepository();
