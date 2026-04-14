import { Router } from 'express';
import { listFiles, readFile } from '../services/file-reader.js';
import { parseMarkdown } from '../services/frontmatter-parser.js';
import {
  rebuildKnowledgeCache,
  getKnowledgeSnippets,
  getKnowledgeByType,
  getKnowledgeBySession,
  getKnowledgeStats,
  type KnowledgeSnippet,
} from '../services/knowledge-extractor.js';
import type { ApiSuccessResponse } from '../types/index.js';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Loads all sessions and rebuilds the knowledge cache.
 */
async function loadAndCacheKnowledge(): Promise<KnowledgeSnippet[]> {
  try {
    const files = await listFiles('sessions', '.md');
    const sessions: Array<{
      id: string;
      slug: string;
      title: string;
      createdAt: string;
      body: string;
    }> = [];

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter, body } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        const slug = frontmatter.slug as string | undefined;
        const title = frontmatter.title as string | undefined;
        const createdAt = frontmatter.createdAt as string | undefined;

        if (id && slug && title && createdAt) {
          sessions.push({ id, slug, title, createdAt, body });
        }
      } catch {
        // Skip unreadable files
      }
    }

    return rebuildKnowledgeCache(sessions);
  } catch {
    return [];
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/knowledge
 * Returns all extracted knowledge snippets.
 *
 * Query parameters:
 * - type: Filter by snippet type (finding, file, action)
 * - sessionId: Filter by parent session ID
 */
router.get('/', async (_req, res) => {
  try {
    // Load and cache knowledge on each request (ensures fresh data)
    await loadAndCacheKnowledge();

    const typeFilter = _req.query.type as string | undefined;
    const sessionIdFilter = _req.query.sessionId as string | undefined;

    let snippets = getKnowledgeSnippets();

    if (typeFilter && ['finding', 'file', 'action'].includes(typeFilter)) {
      snippets = getKnowledgeByType(typeFilter as 'finding' | 'file' | 'action');
    }

    if (sessionIdFilter) {
      snippets = getKnowledgeBySession(sessionIdFilter);
    }

    const stats = getKnowledgeStats();

    const response: ApiSuccessResponse<{
      snippets: KnowledgeSnippet[];
      total: number;
      byType: { findings: number; files: number; actions: number };
    }> = {
      success: true,
      data: {
        snippets,
        total: snippets.length,
        byType: stats.byType,
      },
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/knowledge/stats
 * Returns knowledge statistics.
 */
router.get('/stats', async (_req, res) => {
  try {
    await loadAndCacheKnowledge();
    const stats = getKnowledgeStats();

    const response: ApiSuccessResponse<typeof stats> = {
      success: true,
      data: stats,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/knowledge/session/:sessionId
 * Returns knowledge snippets for a specific session.
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    await loadAndCacheKnowledge();
    const snippets = getKnowledgeBySession(req.params.sessionId);

    const response: ApiSuccessResponse<KnowledgeSnippet[]> = {
      success: true,
      data: snippets,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    throw err;
  }
});

export default router;
