import { Router } from 'express';
import { listFiles, readFile } from '../services/file-reader.js';
import { parseMarkdown } from '../services/frontmatter-parser.js';
import type {
  AgentSummary,
  AgentDetail,
  AgentFrontmatter,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../types/index.js';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts an agent summary from parsed frontmatter.
 */
function toAgentSummary(
  frontmatter: Record<string, unknown>,
  filePath: string,
): AgentSummary | null {
  const id = frontmatter.id as string | undefined;
  const name = frontmatter.name as string | undefined;
  const slug = frontmatter.slug as string | undefined;

  // Derive slug from filename if not in frontmatter
  const derivedSlug = slug || filePath.replace(/\.md$/, '').split('/').pop() || '';

  if (!id && !name) return null;

  const tier = (frontmatter.tier as string) ?? 'utility';
  const status = (frontmatter.status as string) ?? 'active';

  return {
    id: id ?? '',
    name: name ?? derivedSlug,
    slug: derivedSlug,
    emoji: frontmatter.emoji as string | undefined,
    number: frontmatter.number as string | undefined,
    tier: tier as AgentSummary['tier'],
    status: status as AgentSummary['status'],
    model: frontmatter.model as string | undefined,
    shortDescription:
      (frontmatter.shortDescription as string) ??
      (frontmatter.whenToUse as string) ??
      '',
    sessionsCount:
      typeof frontmatter.sessionsCount === 'number'
        ? frontmatter.sessionsCount
        : undefined,
  };
}

/**
 * Parses an agent markdown file and returns the detail.
 */
async function toAgentDetail(filePath: string): Promise<AgentDetail> {
  const raw = await readFile(filePath);
  const { frontmatter, body } = parseMarkdown(raw);

  return {
    frontmatter: frontmatter as unknown as AgentFrontmatter,
    body,
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/agents
 * Returns a list of all agents, optionally filtered by tier and status.
 */
router.get('/', async (req, res) => {
  try {
    const files = await listFiles('agents', '.md');

    const tierFilter = req.query.tier as string | undefined;
    const statusFilter = req.query.status as string | undefined;

    const summaries: AgentSummary[] = [];

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);
        const summary = toAgentSummary(frontmatter, file);

        if (!summary) continue;

        // Apply filters
        if (tierFilter && summary.tier !== tierFilter) continue;
        if (statusFilter && summary.status !== statusFilter) continue;

        summaries.push(summary);
      } catch {
        // Skip unreadable files
      }
    }

    const response: ApiSuccessResponse<{ agents: AgentSummary[] }> = {
      success: true,
      data: { agents: summaries },
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/agents/:slug
 * Returns a single agent's full content (frontmatter + body).
 */
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const files = await listFiles('agents', '.md');

    // Find the file with matching slug
    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);
        const fileSlug =
          (frontmatter.slug as string) ??
          file.replace(/\.md$/, '').split('/').pop() ??
          '';

        if (fileSlug === slug) {
          const detail = await toAgentDetail(file);
          const response: ApiSuccessResponse<AgentDetail> = {
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

    // Agent not found
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'FILE_NOT_FOUND',
        message: `Agent not found: ${slug}`,
        details: { slug },
      },
    };
    res.status(404).json(errorResponse);
  } catch (err) {
    throw err;
  }
});

export default router;
