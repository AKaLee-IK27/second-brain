import Dexie, { type Table } from 'dexie';
import type { NoteRecord, LinkRecord, TagRecord, NoteTagRecord } from '../core/note/note';

export class SecondBrainDB extends Dexie {
  notes!: Table<NoteRecord, string>;
  links!: Table<LinkRecord, string>;
  tags!: Table<TagRecord, string>;
  noteTags!: Table<NoteTagRecord, [string, string]>;

  constructor() {
    super('SecondBrainDB');
    this.version(1).stores({
      notes: 'id, title, createdAt, updatedAt, paraCategory, isDeleted',
      links: 'id, fromNoteId, toNoteId, type',
      tags: 'id, name',
      noteTags: '[noteId+tagId], noteId, tagId',
    });
  }
}

export const db = new SecondBrainDB();
