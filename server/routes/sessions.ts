import { Router } from 'express';
import { listFiles, readFile } from '../services/file-reader.js';
import { parseMarkdown } from '../services/frontmatter-parser.js';
import type {
  SessionSummary,
  SessionDetail,
  SessionsListResponse,
  SessionsMetaResponse,
  SessionFrontmatter,
  SessionTokens,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../types/index.js';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts a session summary from parsed frontmatter.
 */
function toSessionSummary(
  frontmatter: Record<string, unknown>,
  _filePath: string,
): SessionSummary | null {
  const id = frontmatter.id as string | undefined;
  const slug = frontmatter.slug as string | undefined;
  const title = frontmatter.title as string | undefined;
  const agent = frontmatter.agent as string | undefined;
  const model = frontmatter.model as string | undefined;
  const createdAt = frontmatter.createdAt as string | undefined;

  // Skip files without required frontmatter fields
  if (!id || !slug || !title || !agent || !createdAt) {
    return null;
  }

  const tokensRaw = frontmatter.tokens as Record<string, unknown> | undefined;
  const tokens: SessionTokens = {
    input: typeof tokensRaw?.input === 'number' ? tokensRaw.input : 0,
    output: typeof tokensRaw?.output === 'number' ? tokensRaw.output : 0,
    reasoning: typeof tokensRaw?.reasoning === 'number' ? tokensRaw.reasoning : 0,
    total: typeof tokensRaw?.total === 'number' ? tokensRaw.total : 0,
  };

  return {
    id,
    slug,
    title,
    agent,
    model: model ?? '',
    createdAt,
    tokens,
    cost: typeof frontmatter.cost === 'number' ? frontmatter.cost : 0,
    status: ((frontmatter.status as string) ?? 'completed') as SessionSummary['status'],
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags as string[] : undefined,
    duration: typeof frontmatter.duration === 'number' ? frontmatter.duration : undefined,
  };
}

/**
 * Parses a session markdown file and returns the detail.
 */
async function toSessionDetail(filePath: string): Promise<SessionDetail> {
  const raw = await readFile(filePath);
  const { frontmatter, body } = parseMarkdown(raw);

  return {
    frontmatter: frontmatter as unknown as SessionFrontmatter,
    body,
    raw,
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/sessions/meta
 * Returns filter options: agents, statuses, tags, and date range.
 */
router.get('/meta', async (_req, res) => {
  try {
    const files = await listFiles('sessions', '.md');

    const agents = new Set<string>();
    const statuses = new Set<string>();
    const tags = new Set<string>();
    let minDate = '';
    let maxDate = '';

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        if (frontmatter.agent) agents.add(frontmatter.agent as string);
        if (frontmatter.status) statuses.add(frontmatter.status as string);
        if (Array.isArray(frontmatter.tags)) {
          for (const tag of frontmatter.tags as string[]) {
            tags.add(tag);
          }
        }
        if (frontmatter.createdAt) {
          const date = frontmatter.createdAt as string;
          if (!minDate || date < minDate) minDate = date;
          if (!maxDate || date > maxDate) maxDate = date;
        }
      } catch {
        // Skip files that can't be read
      }
    }

    const meta: SessionsMetaResponse = {
      agents: Array.from(agents).sort(),
      statuses: Array.from(statuses).sort(),
      tags: Array.from(tags).sort(),
      dateRange: {
        min: minDate,
        max: maxDate,
      },
    };

    const response: ApiSuccessResponse<SessionsMetaResponse> = {
      success: true,
      data: meta,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    // Let the error handler deal with it
    throw err;
  }
});

/**
 * GET /api/sessions
 * Returns a paginated, filtered, sorted list of sessions.
 */
router.get('/', async (req, res) => {
  try {
    const files = await listFiles('sessions', '.md');

    // Parse query parameters
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 50));
    const agentFilter = req.query.agent as string | undefined;
    const statusFilter = req.query.status as string | undefined;
    const tagsFilter = (req.query.tags as string | undefined)?.split(',').filter(Boolean);
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const sortField = req.query.sort as string | undefined;
    const sortOrder = (req.query.order as 'asc' | 'desc' | undefined) ?? 'desc';

    // Parse all sessions
    const summaries: SessionSummary[] = [];

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);
        const summary = toSessionSummary(frontmatter, file);

        if (!summary) continue;

        // Apply filters
        if (agentFilter && summary.agent !== agentFilter) continue;
        if (statusFilter && summary.status !== statusFilter) continue;
        if (tagsFilter && tagsFilter.length > 0) {
          const sessionTags = summary.tags ?? [];
          const hasAllTags = tagsFilter.every((t) => sessionTags.includes(t));
          if (!hasAllTags) continue;
        }
        if (dateFrom && summary.createdAt < dateFrom) continue;
        if (dateTo && summary.createdAt > dateTo) continue;

        summaries.push(summary);
      } catch {
        // Skip unreadable files
      }
    }

    // Apply sorting
    summaries.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'agent':
          comparison = a.agent.localeCompare(b.agent);
          break;
        case 'tokens':
          comparison = a.tokens.total - b.tokens.total;
          break;
        case 'cost':
          comparison = a.cost - b.cost;
          break;
        case 'duration':
          comparison = (a.duration ?? 0) - (b.duration ?? 0);
          break;
        case 'date':
        default:
          comparison = a.createdAt.localeCompare(b.createdAt);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = summaries.length;
    const startIndex = (page - 1) * limit;
    const paginatedSessions = summaries.slice(startIndex, startIndex + limit);

    const responseData: SessionsListResponse = {
      sessions: paginatedSessions,
      total,
      page,
      limit,
    };

    const response: ApiSuccessResponse<SessionsListResponse> = {
      success: true,
      data: responseData,
      meta: {
        timestamp: new Date().toISOString(),
        totalPages: Math.ceil(total / limit),
      },
    };
    res.json(response);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/sessions/:id
 * Returns a single session's full content (frontmatter + body).
 * The :id parameter matches the session's `id` frontmatter field.
 */
router.get('/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const files = await listFiles('sessions', '.md');

    // Find the file with matching session id
    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        if (frontmatter.id === sessionId) {
          const detail = await toSessionDetail(file);
          const response: ApiSuccessResponse<SessionDetail> = {
            success: true,
            data: detail,
            meta: { timestamp: new Date().toISOString() },
          };
          res.json(response);
          return;
        }
      } catch {
        // Skip unreadable files
      }
    }

    // Session not found
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'FILE_NOT_FOUND',
        message: `Session not found: ${sessionId}`,
        details: { id: sessionId },
      },
    };
    res.status(404).json(errorResponse);
  } catch (err) {
    throw err;
  }
});

export default router;
