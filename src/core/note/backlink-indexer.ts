import type { NoteRecord, LinkRecord } from './note';
import { linkResolver } from './link-resolver';
import { linkRepository } from '../../storage/link-repository';

export class BacklinkIndexer {
  async rebuildAllLinks(notes: NoteRecord[]) {
    linkResolver.buildIndex(notes);
    const links: LinkRecord[] = [];

    for (const note of notes) {
      const extractedLinks = this.extractWikilinks(note.content);
      for (const linkText of extractedLinks) {
        const targetId = linkResolver.resolve(linkText);
        if (targetId && targetId !== note.id) {
          links.push({
            id: `${note.id}→${targetId}`,
            fromNoteId: note.id,
            toNoteId: targetId,
            type: 'wikilink',
            createdAt: Date.now(),
          });
        }
      }
    }

    await linkRepository.clearAll();
    await linkRepository.addMany(links);
    return links;
  }

  extractWikilinks(content: string): string[] {
    const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }
}

export const backlinkIndexer = new BacklinkIndexer();
