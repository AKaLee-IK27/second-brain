import { Router } from 'express';
import { listFiles, readFile } from '../services/file-reader.js';
import { parseMarkdown } from '../services/frontmatter-parser.js';
import type {
  ApiSuccessResponse,
  TopicSummary,
  TopicCategory,
} from '../types/index.js';

const router = Router();

// ─── Types ───────────────────────────────────────────────────────────────────

interface TopicsListResponse {
  topics: TopicSummary[];
  total: number;
}

interface TopicDetailResponse {
  frontmatter: Record<string, unknown>;
  body: string;
  category: string;
}

interface CategoriesListResponse {
  categories: TopicCategory[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts the category from a file path (e.g., "documentation/getting-started.md" → "documentation").
 */
function extractCategory(filePath: string): string {
  const parts = filePath.split('/');
  return parts.length > 1 ? (parts[0] || 'uncategorized') : 'uncategorized';
}

/**
 * Extracts the slug from frontmatter or falls back to the filename.
 */
function extractSlug(frontmatter: Record<string, unknown>, filePath: string): string {
  if (typeof frontmatter.slug === 'string' && frontmatter.slug.length > 0) {
    return frontmatter.slug;
  }
  const basename = filePath.replace(/\.md$/, '').split('/').pop();
  return basename || '';
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/topics
 * Returns a list of all topics with optional filtering by category, type, and status.
 * Query params: category, type, status
 */
router.get('/', async (req, res) => {
  try {
    const files = await listFiles('topics', '.md');

    const categoryFilter = req.query.category as string | undefined;
    const typeFilter = req.query.type as string | undefined;
    const statusFilter = req.query.status as string | undefined;

    const topics: TopicSummary[] = [];

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const slug = extractSlug(frontmatter, file);
        const category = (frontmatter.category as string) || extractCategory(file);

        // Apply filters
        if (categoryFilter && category !== categoryFilter) continue;
        if (typeFilter && frontmatter.type !== typeFilter) continue;
        if (statusFilter && frontmatter.status !== statusFilter) continue;

        topics.push({
          id: (frontmatter.id as string) || '',
          slug,
          title: (frontmatter.title as string) || slug,
          type: (frontmatter.type as TopicSummary['type']) || 'article',
          category,
          status: (frontmatter.status as TopicSummary['status']) || 'draft',
          summary: (frontmatter.summary as string) || '',
          createdAt: (frontmatter.createdAt as string) || '',
          readTime: (frontmatter.readTime as number) || 0,
          tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
        });
      } catch {
        // Skip unreadable or malformed files
      }
    }

    // Sort by date descending
    topics.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    const data: TopicsListResponse = { topics, total: topics.length };
    const response: ApiSuccessResponse<TopicsListResponse> = {
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch {
    // Graceful fallback — return empty list rather than error
    const response: ApiSuccessResponse<TopicsListResponse> = {
      success: true,
      data: { topics: [], total: 0 },
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  }
});

/**
 * GET /api/topics/categories
 * Returns all topic categories with their topic counts, sorted by count descending.
 */
router.get('/categories', async (_req, res) => {
  try {
    const files = await listFiles('topics', '.md');
    const categoryCounts: Record<string, number> = {};

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);
        const category = (frontmatter.category as string) || extractCategory(file);
        categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
      } catch {
        // Skip unreadable files
      }
    }

    const categories: TopicCategory[] = Object.entries(categoryCounts)
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count);

    const data: CategoriesListResponse = { categories };
    const response: ApiSuccessResponse<CategoriesListResponse> = {
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch {
    const response: ApiSuccessResponse<CategoriesListResponse> = {
      success: true,
      data: { categories: [] },
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  }
});

/**
 * GET /api/topics/:slug
 * Returns the full content of a single topic by slug.
 */
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const files = await listFiles('topics', '.md');

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter, body } = parseMarkdown(content);
        const fileSlug = extractSlug(frontmatter, file);

        if (fileSlug === slug) {
          const data: TopicDetailResponse = {
            frontmatter,
            body,
            category: (frontmatter.category as string) || extractCategory(file),
          };
          const response: ApiSuccessResponse<TopicDetailResponse> = {
            success: true,
            data,
            meta: { timestamp: new Date().toISOString() },
          };
          res.json(response);
          return;
        }
      } catch {
        // Skip unreadable files
      }
    }

    res.status(404).json({
      success: false,
      error: {
        code: 'FILE_NOT_FOUND',
        message: `Topic not found: ${slug}`,
      },
    });
  } catch (err) {
    throw err;
  }
});

export default router;
