import { Router } from 'express';
import { listFiles, readFile } from '../services/file-reader.js';
import { parseMarkdown } from '../services/frontmatter-parser.js';
import type { ApiSuccessResponse } from '../types/index.js';

const router = Router();

// ─── Types ───────────────────────────────────────────────────────────────────

interface DailyStat {
  date: string;
  sessions: number;
  tokens: number;
  cost: number;
}

interface AgentStat {
  slug: string;
  sessions: number;
  tokens: number;
  cost: number;
}

interface TagCount {
  name: string;
  count: number;
}

interface ContentCounts {
  sessions: number;
  agents: number;
  skills: number;
  topics: number;
  configs: number;
}

interface SummaryResponse {
  totalSessions: number;
  totalTokens: {
    input: number;
    output: number;
    reasoning: number;
    total: number;
  };
  totalCost: number;
  avgCostPerSession: number;
  contentCounts: ContentCounts;
  agentStats: Record<string, { sessions: number; tokens: number; cost: number }>;
  topTags: TagCount[];
}

interface TimelineResponse {
  data: DailyStat[];
}

interface ByAgentResponse {
  agents: AgentStat[];
}

interface TopTagsResponse {
  tags: TagCount[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Counts markdown files in a directory, returning 0 if the directory doesn't exist.
 */
async function countMarkdownFiles(directory: string): Promise<number> {
  try {
    const files = await listFiles(directory, '.md');
    return files.length;
  } catch {
    return 0;
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/stats/summary
 * Returns aggregate statistics across all sessions and content types.
 */
router.get('/summary', async (_req, res) => {
  try {
    const files = await listFiles('sessions', '.md');

    let totalTokens = 0;
    let totalCost = 0;
    let totalInput = 0;
    let totalOutput = 0;
    let totalReasoning = 0;

    const agentStats: Record<string, { sessions: number; tokens: number; cost: number }> = {};
    const tagCounts: Record<string, number> = {};

    // Count other content types
    const contentCounts: ContentCounts = {
      sessions: files.length,
      agents: await countMarkdownFiles('agents'),
      skills: await countMarkdownFiles('skills'),
      topics: await countMarkdownFiles('topics'),
      configs: await countMarkdownFiles('configs'),
    };

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const tokens = frontmatter.tokens as Record<string, unknown> | undefined;
        const input = typeof tokens?.input === 'number' ? tokens.input : 0;
        const output = typeof tokens?.output === 'number' ? tokens.output : 0;
        const reasoning = typeof tokens?.reasoning === 'number' ? tokens.reasoning : 0;
        const total = typeof tokens?.total === 'number' ? tokens.total : 0;

        totalInput += input;
        totalOutput += output;
        totalReasoning += reasoning;
        totalTokens += total;

        const cost = typeof frontmatter.cost === 'number' ? frontmatter.cost : 0;
        totalCost += cost;

        const agent = (frontmatter.agent as string) ?? 'unknown';
        if (!agentStats[agent]) {
          agentStats[agent] = { sessions: 0, tokens: 0, cost: 0 };
        }
        agentStats[agent].sessions++;
        agentStats[agent].tokens += total;
        agentStats[agent].cost += cost;

        const tags = Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [];
        for (const tag of tags) {
          tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
        }
      } catch {
        // Skip unreadable files
      }
    }

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const data: SummaryResponse = {
      totalSessions: files.length,
      totalTokens: {
        input: totalInput,
        output: totalOutput,
        reasoning: totalReasoning,
        total: totalTokens,
      },
      totalCost,
      avgCostPerSession: files.length > 0 ? totalCost / files.length : 0,
      contentCounts,
      agentStats,
      topTags,
    };

    const response: ApiSuccessResponse<SummaryResponse> = {
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/stats/timeline
 * Returns daily session counts for timeline visualization.
 * Query param: range — one of '7d', '30d', '90d', or 'all' (default).
 */
router.get('/timeline', async (req, res) => {
  try {
    const files = await listFiles('sessions', '.md');

    const dailyCounts: Record<string, DailyStat> = {};

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const createdAt = frontmatter.createdAt as string | undefined;
        const date = createdAt?.slice(0, 10) ?? 'unknown';

        if (!dailyCounts[date]) {
          dailyCounts[date] = { date, sessions: 0, tokens: 0, cost: 0 };
        }

        dailyCounts[date].sessions++;

        const tokens = frontmatter.tokens as Record<string, unknown> | undefined;
        const total = typeof tokens?.total === 'number' ? tokens.total : 0;
        dailyCounts[date].tokens += total;

        const cost = typeof frontmatter.cost === 'number' ? frontmatter.cost : 0;
        dailyCounts[date].cost += cost;
      } catch {
        // Skip unreadable files
      }
    }

    let data = Object.values(dailyCounts).sort((a, b) => a.date.localeCompare(b.date));

    // Apply time range filter
    const range = (req.query.range as string) || 'all';
    const now = new Date();
    let cutoffDate: Date | null = null;

    if (range === '7d') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === '90d') {
      cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    if (cutoffDate) {
      const cutoffStr = cutoffDate.toISOString().slice(0, 10);
      data = data.filter((d: DailyStat) => d.date >= cutoffStr);
    }

    const response: ApiSuccessResponse<TimelineResponse> = {
      success: true,
      data: { data },
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/stats/by-agent
 * Returns session statistics grouped by agent.
 */
router.get('/by-agent', async (_req, res) => {
  try {
    const files = await listFiles('sessions', '.md');

    const agentStats: Record<string, AgentStat> = {};

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const agent = (frontmatter.agent as string) ?? 'unknown';

        if (!agentStats[agent]) {
          agentStats[agent] = { slug: agent, sessions: 0, tokens: 0, cost: 0 };
        }

        agentStats[agent].sessions++;

        const tokens = frontmatter.tokens as Record<string, unknown> | undefined;
        const total = typeof tokens?.total === 'number' ? tokens.total : 0;
        agentStats[agent].tokens += total;

        const cost = typeof frontmatter.cost === 'number' ? frontmatter.cost : 0;
        agentStats[agent].cost += cost;
      } catch {
        // Skip unreadable files
      }
    }

    const agents = Object.values(agentStats).sort((a, b) => b.sessions - a.sessions);

    const response: ApiSuccessResponse<ByAgentResponse> = {
      success: true,
      data: { agents },
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    throw err;
  }
});

/**
 * GET /api/stats/top-tags
 * Returns the most frequently used tags across sessions.
 * Query param: limit (default 10)
 */
router.get('/top-tags', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));

    const files = await listFiles('sessions', '.md');

    const tagCounts: Record<string, number> = {};

    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const tags = Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [];
        for (const tag of tags) {
          tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
        }
      } catch {
        // Skip unreadable files
      }
    }

    const tags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));

    const response: ApiSuccessResponse<TopTagsResponse> = {
      success: true,
      data: { tags },
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    throw err;
  }
});

export default router;
