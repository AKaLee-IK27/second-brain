/**
 * Graph Builder Service
 *
 * Builds a unified graph from all entity types:
 * - Notes (from IndexedDB via client-side merge)
 * - Sessions, Topics, Agents, Skills (from filesystem)
 *
 * Returns nodes and edges for visualization.
 */

import { listFiles, readFile } from './file-reader.js';
import { parseMarkdown } from './frontmatter-parser.js';

export interface GraphNode {
  id: string;
  label: string;
  type: 'session' | 'topic' | 'agent' | 'skill';
  color: string;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'relatedSessions' | 'relatedTopics' | 'sourceSession' | 'agentsUsed' | 'skillsUsed';
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  counts: {
    sessions: number;
    topics: number;
    agents: number;
    skills: number;
  };
}

// Color scheme matching design spec
const NODE_COLORS = {
  session: '#6366f1',  // indigo/blue
  topic: '#22c55e',    // green
  agent: '#a855f7',    // purple
  skill: '#f97316',    // orange
};

/**
 * Builds the unified graph from all entity types.
 * Notes are excluded here — they're merged client-side from IndexedDB.
 */
export async function buildGraph(): Promise<GraphResponse> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Build session nodes
  const sessionNodes = await buildSessionNodes();
  nodes.push(...sessionNodes);

  // Build topic nodes
  const topicNodes = await buildTopicNodes();
  nodes.push(...topicNodes);

  // Build agent nodes
  const agentNodes = await buildAgentNodes();
  nodes.push(...agentNodes);

  // Build skill nodes
  const skillNodes = await buildSkillNodes();
  nodes.push(...skillNodes);

  // Build edges
  edges.push(...await buildSessionEdges());
  edges.push(...await buildTopicEdges());

  return {
    nodes,
    edges,
    counts: {
      sessions: sessionNodes.length,
      topics: topicNodes.length,
      agents: agentNodes.length,
      skills: skillNodes.length,
    },
  };
}

async function buildSessionNodes(): Promise<GraphNode[]> {
  const nodes: GraphNode[] = [];
  try {
    const files = await listFiles('sessions', '.md');
    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        const title = frontmatter.title as string | undefined;
        const slug = frontmatter.slug as string | undefined;

        if (id && title && slug) {
          nodes.push({
            id: `session:${id}`,
            label: title,
            type: 'session',
            color: NODE_COLORS.session,
            metadata: {
              entityType: 'session',
              slug,
              agent: frontmatter.agent ?? '',
              status: frontmatter.status ?? 'completed',
              createdAt: frontmatter.createdAt ?? '',
            },
          });
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Return empty array if sessions directory doesn't exist
  }
  return nodes;
}

async function buildTopicNodes(): Promise<GraphNode[]> {
  const nodes: GraphNode[] = [];
  try {
    const files = await listFiles('topics', '.md');
    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        const title = frontmatter.title as string | undefined;
        const slug = frontmatter.slug as string | undefined;

        if (id && title && slug) {
          nodes.push({
            id: `topic:${id}`,
            label: title,
            type: 'topic',
            color: NODE_COLORS.topic,
            metadata: {
              entityType: 'topic',
              slug,
              category: frontmatter.category ?? '',
              type: frontmatter.type ?? '',
            },
          });
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Return empty array if topics directory doesn't exist
  }
  return nodes;
}

async function buildAgentNodes(): Promise<GraphNode[]> {
  const nodes: GraphNode[] = [];
  try {
    const files = await listFiles('agents', '.md');
    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        const name = frontmatter.name as string | undefined;
        const slug = frontmatter.slug as string | undefined;

        if (id && name && slug) {
          nodes.push({
            id: `agent:${id}`,
            label: name,
            type: 'agent',
            color: NODE_COLORS.agent,
            metadata: {
              entityType: 'agent',
              slug,
              tier: frontmatter.tier ?? '',
              status: frontmatter.status ?? 'active',
            },
          });
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Return empty array if agents directory doesn't exist
  }
  return nodes;
}

async function buildSkillNodes(): Promise<GraphNode[]> {
  const nodes: GraphNode[] = [];
  try {
    const files = await listFiles('skills', '.md');
    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        const name = frontmatter.name as string | undefined;
        const slug = frontmatter.slug as string | undefined;

        if (id && name && slug) {
          nodes.push({
            id: `skill:${id}`,
            label: name,
            type: 'skill',
            color: NODE_COLORS.skill,
            metadata: {
              entityType: 'skill',
              slug,
              category: frontmatter.category ?? '',
              status: frontmatter.status ?? 'active',
            },
          });
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Return empty array if skills directory doesn't exist
  }
  return nodes;
}

async function buildSessionEdges(): Promise<GraphEdge[]> {
  const edges: GraphEdge[] = [];
  try {
    const files = await listFiles('sessions', '.md');
    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        if (!id) continue;

        const sourceId = `session:${id}`;

        // relatedSessions edges
        const relatedSessions = frontmatter.relatedSessions as string[] | undefined;
        if (relatedSessions) {
          for (const relatedId of relatedSessions) {
            edges.push({
              source: sourceId,
              target: `session:${relatedId}`,
              type: 'relatedSessions',
            });
          }
        }

        // agentsUsed edges (from agent field)
        const agent = frontmatter.agent as string | undefined;
        if (agent) {
          // We'll resolve agent name to ID when building the full graph
          // For now, store as a reference
          edges.push({
            source: sourceId,
            target: `agent:${agent}`,
            type: 'agentsUsed',
          });
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Return empty array
  }
  return edges;
}

async function buildTopicEdges(): Promise<GraphEdge[]> {
  const edges: GraphEdge[] = [];
  try {
    const files = await listFiles('topics', '.md');
    for (const file of files) {
      try {
        const content = await readFile(file);
        const { frontmatter } = parseMarkdown(content);

        const id = frontmatter.id as string | undefined;
        if (!id) continue;

        const sourceId = `topic:${id}`;

        // sourceSession edge
        const sourceSession = frontmatter.sourceSession as string | undefined;
        if (sourceSession) {
          edges.push({
            source: sourceId,
            target: `session:${sourceSession}`,
            type: 'sourceSession',
          });
        }

        // relatedTopics edges
        const relatedTopics = frontmatter.relatedTopics as string[] | undefined;
        if (relatedTopics) {
          for (const relatedId of relatedTopics) {
            edges.push({
              source: sourceId,
              target: `topic:${relatedId}`,
              type: 'relatedTopics',
            });
          }
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Return empty array
  }
  return edges;
}
