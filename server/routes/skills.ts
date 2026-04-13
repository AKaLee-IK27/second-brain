import { Router } from 'express';
import { listFiles, readFile } from '../services/file-reader.js';
import { parseMarkdown } from '../services/frontmatter-parser.js';
import type {
  SkillSummary,
  SkillDetail,
  SkillFrontmatter,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../types/index.js';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts a skill summary from parsed frontmatter.
 */
function toSkillSummary(
  frontmatter: Record<string, unknown>,
  filePath: string,
): SkillSummary | null {
  const id = frontmatter.id as string | undefined;
  const name = frontmatter.name as string | undefined;
  const slug = frontmatter.slug as string | undefined;

  // Derive slug from filename if not in frontmatter
  const derivedSlug = slug || filePath.replace(/\.md$/, '').split('/').pop() || '';

  if (!id && !name) return null;

  const category = (frontmatter.category as string) ?? 'unknown';
  const status = (frontmatter.status as string) ?? 'active';

  return {
    id: id ?? '',
    name: name ?? derivedSlug,
    slug: derivedSlug,
    emoji: frontmatter.emoji as string | undefined,
    category,
    status: status as SkillSummary['status'],
    shortDescription: frontmatter.shortDescription as string | undefined,
    compatibleAgents: Array.isArray(frontmatter.compatibleAgents)
      ? (frontmatter.compatibleAgents as string[])
      : undefined,
  };
}

/**
 * Parses a skill markdown file and returns the detail.
 */
async function toSkillDetail(filePath: string): Promise<SkillDetail> {
  const raw = await readFile(filePath);
  const { frontmatter, body } = parseMarkdown(raw);

  return {
    frontmatter: frontmatter as unknown as SkillFrontmatter,
    body,
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/skills
 * Returns a list of all skills, optionally filtered by category and status.
 */
router.get('/', async (req, res) => {
  try {
    const files = await listFiles('skills', '.md');

    const categoryFilter = req.query.category as string | undefined;
    const statusFilter = req.query.status as string | undefined;

    const summaries: SkillSummary[] = [];

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);
        const summary = toSkillSummary(frontmatter, file);

        if (!summary) continue;

        // Apply filters
        if (categoryFilter && summary.category !== categoryFilter) continue;
        if (statusFilter && summary.status !== statusFilter) continue;

        summaries.push(summary);
      } catch {
        // Skip unreadable files
      }
    }

    const response: ApiSuccessResponse<{ skills: SkillSummary[] }> = {
      success: true,
      data: { skills: summaries },
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/skills/:slug
 * Returns a single skill's full content (frontmatter + body).
 */
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const files = await listFiles('skills', '.md');

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
          const detail = await toSkillDetail(file);
          const response: ApiSuccessResponse<SkillDetail> = {
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

    // Skill not found
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'FILE_NOT_FOUND',
        message: `Skill not found: ${slug}`,
        details: { slug },
      },
    };
    res.status(404).json(errorResponse);
  } catch (err) {
    throw err;
  }
});

export default router;
