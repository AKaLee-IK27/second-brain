import { Router } from 'express';
import { listFiles, readFile } from '../services/file-reader.js';
import { parseMarkdown } from '../services/frontmatter-parser.js';
import type {
  ConfigSummary,
  ConfigDetail,
  ConfigFrontmatter,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../types/index.js';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts a config summary from parsed frontmatter.
 */
function toConfigSummary(
  frontmatter: Record<string, unknown>,
  filePath: string,
): ConfigSummary | null {
  const id = frontmatter.id as string | undefined;
  const name = frontmatter.name as string | undefined;
  const slug = frontmatter.slug as string | undefined;

  // Derive slug from filename if not in frontmatter
  const derivedSlug = slug || filePath.replace(/\.md$/, '').split('/').pop() || '';

  if (!id && !name) return null;

  const type = (frontmatter.type as string) ?? 'unknown';
  const scope = (frontmatter.scope as string) ?? 'global';
  const lastSynced = (frontmatter.lastSynced as string) ?? '';

  return {
    id: id ?? '',
    name: name ?? derivedSlug,
    slug: derivedSlug,
    type: type as ConfigSummary['type'],
    scope: scope as ConfigSummary['scope'],
    lastSynced,
  };
}

/**
 * Parses a config markdown file and returns the detail.
 */
async function toConfigDetail(filePath: string): Promise<ConfigDetail> {
  const raw = await readFile(filePath);
  const { frontmatter, body } = parseMarkdown(raw);

  return {
    frontmatter: frontmatter as unknown as ConfigFrontmatter,
    body,
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/configs
 * Returns a list of all configs, optionally filtered by type and scope.
 */
router.get('/', async (req, res) => {
  try {
    const files = await listFiles('configs', '.md');

    const typeFilter = req.query.type as string | undefined;
    const scopeFilter = req.query.scope as string | undefined;

    const summaries: ConfigSummary[] = [];

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);
        const summary = toConfigSummary(frontmatter, file);

        if (!summary) continue;

        // Apply filters
        if (typeFilter && summary.type !== typeFilter) continue;
        if (scopeFilter && summary.scope !== scopeFilter) continue;

        summaries.push(summary);
      } catch {
        // Skip unreadable files
      }
    }

    const response: ApiSuccessResponse<{ configs: ConfigSummary[] }> = {
      success: true,
      data: { configs: summaries },
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/configs/:slug
 * Returns a single config's full content (frontmatter + body).
 */
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const files = await listFiles('configs', '.md');

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
          const detail = await toConfigDetail(file);
          const response: ApiSuccessResponse<ConfigDetail> = {
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

    // Config not found
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'FILE_NOT_FOUND',
        message: `Config not found: ${slug}`,
        details: { slug },
      },
    };
    res.status(404).json(errorResponse);
  } catch (err) {
    throw err;
  }
});

export default router;
