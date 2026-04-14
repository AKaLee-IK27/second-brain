import { Router } from 'express';
import {
  computeSessionBacklinks,
  computeTopicBacklinks,
  computeAgentUsedIn,
  computeSkillUsedIn,
} from '../services/backlink-computer.js';
import type { ApiSuccessResponse, ApiErrorResponse } from '../types/index.js';

const router = Router();

/**
 * GET /api/backlinks/session/:id
 * Returns backlinks for a specific session.
 */
router.get('/session/:id', async (req, res) => {
  try {
    const backlinks = await computeSessionBacklinks(req.params.id);

    const response: ApiSuccessResponse<typeof backlinks> = {
      success: true,
      data: backlinks,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to compute session backlinks',
        details: { error: err instanceof Error ? err.message : 'Unknown error' },
      },
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/backlinks/topic/:slug
 * Returns backlinks for a specific topic.
 */
router.get('/topic/:slug', async (req, res) => {
  try {
    const backlinks = await computeTopicBacklinks(req.params.slug);

    const response: ApiSuccessResponse<typeof backlinks> = {
      success: true,
      data: backlinks,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to compute topic backlinks',
        details: { error: err instanceof Error ? err.message : 'Unknown error' },
      },
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/backlinks/agent/:slug/used-in
 * Returns sessions that used a specific agent.
 */
router.get('/agent/:slug/used-in', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const usedIn = await computeAgentUsedIn(req.params.slug, limit);

    const response: ApiSuccessResponse<typeof usedIn> = {
      success: true,
      data: usedIn,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to compute agent usage',
        details: { error: err instanceof Error ? err.message : 'Unknown error' },
      },
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/backlinks/skill/:slug/used-in
 * Returns sessions that used a specific skill.
 */
router.get('/skill/:slug/used-in', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const usedIn = await computeSkillUsedIn(req.params.slug, limit);

    const response: ApiSuccessResponse<typeof usedIn> = {
      success: true,
      data: usedIn,
      meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
  } catch (err) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to compute skill usage',
        details: { error: err instanceof Error ? err.message : 'Unknown error' },
      },
    };
    res.status(500).json(errorResponse);
  }
});

export default router;
