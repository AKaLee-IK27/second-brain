import { Router } from 'express';
import { migrationEngine } from '../services/migration-engine.js';
import { getDataRoot } from '../config.js';
import type { ApiSuccessResponse, ApiErrorResponse } from '../types/index.js';

const router = Router();

// ─── POST /api/migrate/start ─────────────────────────────────────────────────
// Starts the migration process asynchronously.
// Body: { sqlitePath?: string, dryRun?: boolean }

router.post('/start', async (req, res) => {
  const progress = migrationEngine.getProgress();

  // Prevent concurrent migrations
  if (progress.status === 'running') {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'MIGRATION_IN_PROGRESS',
        message: 'A migration is already in progress. Check /api/migrate/status for updates.',
      },
    };
    res.status(409).json(errorResponse);
    return;
  }

  const { sqlitePath, dryRun } = (req.body ?? {}) as {
    sqlitePath?: string;
    dryRun?: boolean;
  };

  const dataRoot = getDataRoot();

  if (!dataRoot) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'DATA_ROOT_NOT_SET',
        message: 'No data root configured. Please set the data root before starting migration.',
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  migrationEngine.setOutputRoot(dataRoot);

  // Allow overriding the default SQLite path
  if (sqlitePath && typeof sqlitePath === 'string') {
    // Basic path traversal check on input
    if (sqlitePath.includes('..')) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'PATH_TRAVERSAL',
          message: 'SQLite path must not contain ".." sequences.',
        },
      };
      res.status(403).json(errorResponse);
      return;
    }
    (migrationEngine as unknown as Record<string, string>).dbPath = sqlitePath;
  }

  // Run asynchronously — don't block the response
  const migrationId = `mig_${Date.now()}`;

  migrationEngine
    .run(dryRun === true)
    .then((result) => {
      console.log(
        `Migration ${migrationId} completed: ${result.current}/${result.total} sessions, ${result.errors.length} errors`,
      );
    })
    .catch((err) => {
      console.error(`Migration ${migrationId} failed:`, err);
    });

  const response: ApiSuccessResponse<{ migrationId: string; status: string }> = {
    success: true,
    data: { migrationId, status: 'running' },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
});

// ─── GET /api/migrate/status ─────────────────────────────────────────────────
// Returns the current migration progress.

router.get('/status', (_req, res) => {
  const progress = migrationEngine.getProgress();

  const response: ApiSuccessResponse<{
    status: string;
    current: number;
    total: number;
    errors: string[];
    startedAt?: number;
    completedAt?: number;
  }> = {
    success: true,
    data: {
      status: progress.status,
      current: progress.current,
      total: progress.total,
      errors: progress.errors,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
    },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
});

// ─── GET /api/migrate/report ─────────────────────────────────────────────────
// Returns a summary report of the last completed migration.

router.get('/report', (_req, res) => {
  const progress = migrationEngine.getProgress();

  const duration =
    progress.startedAt && progress.completedAt
      ? `${((progress.completedAt - progress.startedAt) / 1000).toFixed(1)}s`
      : null;

  const response: ApiSuccessResponse<{
    status: string;
    migrated: number;
    failed: number;
    total: number;
    errors: string[];
    duration: string | null;
  }> = {
    success: true,
    data: {
      status: progress.status,
      migrated: Math.max(0, progress.current - progress.errors.length),
      failed: progress.errors.length,
      total: progress.total,
      errors: progress.errors,
      duration,
    },
    meta: { timestamp: new Date().toISOString() },
  };
  res.json(response);
});

export default router;
