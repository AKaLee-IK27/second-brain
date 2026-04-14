/**
 * Knowledge Extractor Service
 *
 * Extracts structured knowledge snippets from session markdown files.
 * Parses specific sections:
 * - `## Key Findings` → knowledge findings
 * - `## Files Modified` → file references
 * - `## Next Steps` → action items
 *
 * Extraction happens during file indexing (single pass).
 */

export interface KnowledgeSnippet {
  id: string;
  sessionId: string;
  sessionSlug: string;
  sessionTitle: string;
  type: 'finding' | 'file' | 'action';
  content: string;
  sourceSection: string;
  createdAt: number;
}

interface KnowledgeCache {
  snippets: KnowledgeSnippet[];
  lastUpdated: number;
}

let cache: KnowledgeCache = { snippets: [], lastUpdated: 0 };

/**
 * Extracts knowledge snippets from a session markdown body.
 * Returns an array of KnowledgeSnippet objects.
 */
export function extractKnowledgeFromBody(
  body: string,
  sessionId: string,
  sessionSlug: string,
  sessionTitle: string,
  sessionCreatedAt: string,
): KnowledgeSnippet[] {
  const snippets: KnowledgeSnippet[] = [];
  const createdAt = new Date(sessionCreatedAt).getTime() || Date.now();

  // Extract sections using markdown heading regex
  const sections = extractSections(body);

  // Process Key Findings
  if (sections['Key Findings']) {
    const items = parseListItems(sections['Key Findings']);
    items.forEach((content, index) => {
      snippets.push({
        id: `${sessionId}-finding-${index}`,
        sessionId,
        sessionSlug,
        sessionTitle,
        type: 'finding',
        content,
        sourceSection: 'Key Findings',
        createdAt,
      });
    });
  }

  // Process Files Modified
  if (sections['Files Modified']) {
    const items = parseListItems(sections['Files Modified']);
    items.forEach((content, index) => {
      snippets.push({
        id: `${sessionId}-file-${index}`,
        sessionId,
        sessionSlug,
        sessionTitle,
        type: 'file',
        content,
        sourceSection: 'Files Modified',
        createdAt,
      });
    });
  }

  // Process Next Steps
  if (sections['Next Steps']) {
    const items = parseListItems(sections['Next Steps']);
    items.forEach((content, index) => {
      snippets.push({
        id: `${sessionId}-action-${index}`,
        sessionId,
        sessionSlug,
        sessionTitle,
        type: 'action',
        content,
        sourceSection: 'Next Steps',
        createdAt,
      });
    });
  }

  return snippets;
}

/**
 * Extracts sections from markdown body by ## headings.
 * Returns a map of section name → content.
 */
function extractSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const headingRegex = /^## (.+)$/gm;
  let match;

  const headings: { name: string; start: number; end: number }[] = [];

  while ((match = headingRegex.exec(body)) !== null) {
    const matchIndex = match.index ?? 0;
    const matchLength = match[0].length;
    const headingName = match[1] ? match[1].trim() : '';
    if (!headingName) continue;
    headings.push({
      name: headingName,
      start: matchIndex + matchLength,
      end: 0, // Will be set by next heading or end of file
    });
  }

  // Set end positions
  for (let i = 0; i < headings.length; i++) {
    const current = headings[i];
    const nextHeading = headings[i + 1];
    if (!current) continue;
    if (i < headings.length - 1 && nextHeading) {
      current.end = nextHeading.start;
    } else {
      current.end = body.length;
    }
  }

  // Extract content for each section
  for (const heading of headings) {
    const content = body.slice(heading.start, heading.end).trim();
    sections[heading.name] = content;
  }

  return sections;
}

/**
 * Parses list items from markdown content.
 * Handles both `- item` and `* item` formats.
 */
function parseListItems(content: string): string[] {
  const items: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const item = trimmed.slice(2).trim();
      if (item) {
        items.push(item);
      }
    }
  }

  return items;
}

/**
 * Rebuilds the knowledge cache from session data.
 * Called during file indexing or when session files change.
 */
export function rebuildKnowledgeCache(
  sessions: Array<{
    id: string;
    slug: string;
    title: string;
    createdAt: string;
    body: string;
  }>,
): KnowledgeSnippet[] {
  const allSnippets: KnowledgeSnippet[] = [];

  for (const session of sessions) {
    const snippets = extractKnowledgeFromBody(
      session.body,
      session.id,
      session.slug,
      session.title,
      session.createdAt,
    );
    allSnippets.push(...snippets);
  }

  cache = {
    snippets: allSnippets,
    lastUpdated: Date.now(),
  };

  return allSnippets;
}

/**
 * Returns the cached knowledge snippets.
 */
export function getKnowledgeSnippets(): KnowledgeSnippet[] {
  return cache.snippets;
}

/**
 * Returns knowledge snippets filtered by type.
 */
export function getKnowledgeByType(type: 'finding' | 'file' | 'action'): KnowledgeSnippet[] {
  return cache.snippets.filter((s) => s.type === type);
}

/**
 * Returns knowledge snippets for a specific session.
 */
export function getKnowledgeBySession(sessionId: string): KnowledgeSnippet[] {
  return cache.snippets.filter((s) => s.sessionId === sessionId);
}

/**
 * Returns knowledge statistics.
 */
export function getKnowledgeStats(): {
  total: number;
  byType: { findings: number; files: number; actions: number };
} {
  return {
    total: cache.snippets.length,
    byType: {
      findings: cache.snippets.filter((s) => s.type === 'finding').length,
      files: cache.snippets.filter((s) => s.type === 'file').length,
      actions: cache.snippets.filter((s) => s.type === 'action').length,
    },
  };
}
