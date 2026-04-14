import { Router } from 'express';
import { buildGraph } from '../services/graph-builder.js';
import type { ApiSuccessResponse, ApiErrorResponse } from '../types/index.js';

const router = Router();

/**
 * GET /api/graph
 * Returns unified graph data (nodes + edges).
 *
 * Query parameters:
 * - types: Comma-separated entity types to include (session,topic,agent,skill)
 * - days: Limit to entities created in the last N days
 */
router.get('/', async (req, res) => {
  try {
    const graph = await buildGraph();

    // Filter by types if specified
    const typesParam = req.query.types as string | undefined;
    if (typesParam) {
      const allowedTypes = typesParam.split(',').map((t) => t.trim());
      graph.nodes = graph.nodes.filter((n) => allowedTypes.includes(n.type));

      // Filter edges to only include those between visible nodes
      const visibleNodeIds = new Set(graph.nodes.map((n) => n.id));
      graph.edges = graph.edges.filter(
        (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
      );

      // Update counts
      graph.counts = {
        sessions: graph.nodes.filter((n) => n.type === 'session').length,
        topics: graph.nodes.filter((n) => n.type === 'topic').length,
        agents: graph.nodes.filter((n) => n.type === 'agent').length,
        skills: graph.nodes.filter((n) => n.type === 'skill').length,
      };
    }

    const response: ApiSuccessResponse<typeof graph> = {
      success: true,
      data: graph,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to build graph',
        details: { error: err instanceof Error ? err.message : 'Unknown error' },
      },
    };
    res.status(500).json(errorResponse);
  }
});

export default router;
