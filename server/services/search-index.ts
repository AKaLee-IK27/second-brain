import Fuse from 'fuse.js';
import { listFiles, readFile } from './file-reader.js';
import { parseMarkdown } from './frontmatter-parser.js';
import { getDataRoot } from '../config.js';

export interface SearchItem {
  type: 'session' | 'agent' | 'skill' | 'topic' | 'config';
  id: string;
  slug: string;
  title: string;
  content: string;
  tags?: string[];
  agent?: string;
  category?: string;
  createdAt?: string;
}

export class SearchIndex {
  private fuse: Fuse<SearchItem> | null = null;
  private items: SearchItem[] = [];
  private lastBuilt: string | null = null;
  private building = false;

  async build(): Promise<void> {
    if (this.building) return;
    this.building = true;

    try {
      this.items = [];
      const dataRoot = getDataRoot();
      if (!dataRoot) return;

      // Index sessions
      try {
        const sessionFiles = await listFiles('sessions', '.md');
        for (const file of sessionFiles.slice(0, 500)) { // Limit for performance
          try {
            const content = await readFile(file);
            const { frontmatter, body } = parseMarkdown(content);
            this.items.push({
              type: 'session',
              id: (frontmatter.id as string) || file,
              slug: (frontmatter.slug as string) || file.replace(/\.md$/, '').split('/').pop() || '',
              title: (frontmatter.title as string) || '',
              content: `${body} ${(Array.isArray(frontmatter.tags) ? frontmatter.tags : []).join(' ')} ${frontmatter.agent || ''}`,
              tags: frontmatter.tags as string[] | undefined,
              agent: frontmatter.agent as string | undefined,
              createdAt: frontmatter.createdAt as string | undefined,
            });
          } catch { /* skip */ }
        }
      } catch { /* skip */ }

      // Index agents
      try {
        const agentFiles = await listFiles('agents', '.md');
        for (const file of agentFiles) {
          try {
            const content = await readFile(file);
            const { frontmatter, body } = parseMarkdown(content);
            this.items.push({
              type: 'agent',
              id: (frontmatter.id as string) || file,
              slug: (frontmatter.slug as string) || file.replace(/\.md$/, '').split('/').pop() || '',
              title: (frontmatter.name as string) || '',
              content: `${body} ${frontmatter.whenToUse || ''}`,
              category: frontmatter.tier as string | undefined,
            });
          } catch { /* skip */ }
        }
      } catch { /* skip */ }

      // Index skills
      try {
        const skillFiles = await listFiles('skills', '.md');
        for (const file of skillFiles) {
          try {
            const content = await readFile(file);
            const { frontmatter, body } = parseMarkdown(content);
            this.items.push({
              type: 'skill',
              id: (frontmatter.id as string) || file,
              slug: (frontmatter.slug as string) || file.replace(/\.md$/, '').split('/').pop() || '',
              title: (frontmatter.name as string) || '',
              content: `${body} ${frontmatter.whenToUse || ''}`,
              category: frontmatter.category as string | undefined,
            });
          } catch { /* skip */ }
        }
      } catch { /* skip */ }

      // Index topics
      try {
        const topicFiles = await listFiles('topics', '.md');
        for (const file of topicFiles) {
          try {
            const content = await readFile(file);
            const { frontmatter, body } = parseMarkdown(content);
            this.items.push({
              type: 'topic',
              id: (frontmatter.id as string) || file,
              slug: (frontmatter.slug as string) || file.replace(/\.md$/, '').split('/').pop() || '',
              title: (frontmatter.title as string) || '',
              content: `${body} ${(Array.isArray(frontmatter.tags) ? frontmatter.tags : []).join(' ')} ${frontmatter.summary || ''}`,
              tags: frontmatter.tags as string[] | undefined,
              category: frontmatter.category as string | undefined,
              createdAt: frontmatter.createdAt as string | undefined,
            });
          } catch { /* skip */ }
        }
      } catch { /* skip */ }

      // Index configs
      try {
        const configFiles = await listFiles('configs', '.md');
        for (const file of configFiles) {
          try {
            const content = await readFile(file);
            const { frontmatter, body } = parseMarkdown(content);
            this.items.push({
              type: 'config',
              id: (frontmatter.id as string) || file,
              slug: (frontmatter.slug as string) || file.replace(/\.md$/, '').split('/').pop() || '',
              title: (frontmatter.name as string) || '',
              content: body,
              category: frontmatter.type as string | undefined,
            });
          } catch { /* skip */ }
        }
      } catch { /* skip */ }

      // Build Fuse.js index with weighted fields
      this.fuse = new Fuse(this.items, {
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'content', weight: 0.3 },
          { name: 'tags', weight: 0.1 },
          { name: 'agent', weight: 0.05 },
          { name: 'category', weight: 0.05 },
        ],
        threshold: 0.4,
        includeScore: true,
        includeMatches: true,
      });

      this.lastBuilt = new Date().toISOString();
      console.log(`🔍 Search index built: ${this.items.length} items`);
    } finally {
      this.building = false;
    }
  }

  search(query: string, typeFilter?: string, limit: number = 20): SearchItem[] {
    if (!this.fuse || this.items.length === 0) return [];

    let results = this.fuse.search(query, { limit: limit * 3 });

    if (typeFilter) {
      results = results.filter(r => r.item.type === typeFilter);
    }

    return results.slice(0, limit).map(r => r.item);
  }

  getStatus(): { indexed: number; lastBuilt: string | null } {
    return { indexed: this.items.length, lastBuilt: this.lastBuilt };
  }
}

export const searchIndex = new SearchIndex();
