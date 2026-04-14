/**
 * Backlink Computer Service
 *
 * Computes cross-entity backlinks for sessions, topics, agents, and skills.
 * All computation happens server-side for efficiency.
 */

import { listFiles, readFile } from './file-reader.js';
import { parseMarkdown } from './frontmatter-parser.js';

export interface SessionBacklink {
  sessions: Array<{ id: string; slug: string; title: string; relationship: 'relatedSessions' | 'parentSession' }>;
  topics: Array<{ id: string; slug: string; title: string; relationship: 'sourceSession' }>;
}

export interface TopicBacklink {
  sessions: Array<{ id: string; slug: string; title: string }>;
  topics: Array<{ id: string; slug: string; title: string }>;
}

export interface UsedInResponse {
  sessions: Array<{ id: string; slug: string; title: string; createdAt: string }>;
  totalCount: number;
}

/**
 * Computes backlinks for a specific session.
 */
export async function computeSessionBacklinks(sessionId: string): Promise<SessionBacklink> {
  const result: SessionBacklink = { sessions: [], topics: [] };

  try {
    // Find sessions that reference this session
    const sessionFiles = await listFiles('sessions', '.md');
    for (const file of sessionFiles) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        const slug = frontmatter.slug as string | undefined;
        const title = frontmatter.title as string | undefined;

        if (!id || !slug || !title) continue;

        // Check relatedSessions
        const relatedSessions = frontmatter.relatedSessions as string[] | undefined;
        if (relatedSessions?.includes(sessionId)) {
          result.sessions.push({ id, slug, title, relationship: 'relatedSessions' });
        }

        // Check parentSession
        const parentSession = frontmatter.parentSession as string | undefined;
        if (parentSession === sessionId) {
          result.sessions.push({ id, slug, title, relationship: 'parentSession' });
        }
      } catch {
        // Skip unreadable files
      }
    }

    // Find topics that cite this session
    const topicFiles = await listFiles('topics', '.md');
    for (const file of topicFiles) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        const slug = frontmatter.slug as string | undefined;
        const title = frontmatter.title as string | undefined;

        if (!id || !slug || !title) continue;

        const sourceSession = frontmatter.sourceSession as string | undefined;
        if (sourceSession === sessionId) {
          result.topics.push({ id, slug, title, relationship: 'sourceSession' });
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Return empty result if directories don't exist
  }

  return result;
}

/**
 * Computes backlinks for a specific topic.
 */
export async function computeTopicBacklinks(topicId: string): Promise<TopicBacklink> {
  const result: TopicBacklink = { sessions: [], topics: [] };

  try {
    // Find sessions that have this topic in relatedTopics
    const sessionFiles = await listFiles('sessions', '.md');
    for (const file of sessionFiles) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        const slug = frontmatter.slug as string | undefined;
        const title = frontmatter.title as string | undefined;

        if (!id || !slug || !title) continue;

        const relatedTopics = frontmatter.relatedTopics as string[] | undefined;
        if (relatedTopics?.includes(topicId)) {
          result.sessions.push({ id, slug, title });
        }
      } catch {
        // Skip unreadable files
      }
    }

    // Find topics that reference this topic
    const topicFiles = await listFiles('topics', '.md');
    for (const file of topicFiles) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        const slug = frontmatter.slug as string | undefined;
        const title = frontmatter.title as string | undefined;

        if (!id || !slug || !title) continue;
        if (id === topicId) continue; // Skip self

        const relatedTopics = frontmatter.relatedTopics as string[] | undefined;
        if (relatedTopics?.includes(topicId)) {
          result.topics.push({ id, slug, title });
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Return empty result if directories don't exist
  }

  return result;
}

/**
 * Computes sessions that used a specific agent.
 */
export async function computeAgentUsedIn(agentId: string, limit = 10): Promise<UsedInResponse> {
  const sessions: UsedInResponse['sessions'] = [];

  try {
    const sessionFiles = await listFiles('sessions', '.md');
    for (const file of sessionFiles) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        const slug = frontmatter.slug as string | undefined;
        const title = frontmatter.title as string | undefined;
        const createdAt = frontmatter.createdAt as string | undefined;
        const agent = frontmatter.agent as string | undefined;

        if (!id || !slug || !title || !createdAt) continue;

        // Match by agent name (since agent field stores name, not ID)
        if (agent === agentId) {
          sessions.push({ id, slug, title, createdAt });
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Return empty result
  }

  // Sort by date descending and limit
  sessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    sessions: sessions.slice(0, limit),
    totalCount: sessions.length,
  };
}

/**
 * Computes sessions that used a specific skill.
 * Note: Skills are tracked via session content analysis, not frontmatter.
 * For now, we return empty since there's no direct skillsUsed field in sessions.
 */
export async function computeSkillUsedIn(_skillId: string, _limit = 10): Promise<UsedInResponse> {
  // Skills are not directly tracked in session frontmatter
  // This would require parsing session content to find skill usage
  return { sessions: [], totalCount: 0 };
}
