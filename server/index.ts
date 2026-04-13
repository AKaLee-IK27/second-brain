import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, getDataRoot } from './config.js';
import configRoutes from './routes/config.js';
import sessionRoutes from './routes/sessions.js';
import migrationRoutes from './routes/migration.js';
import agentRoutes from './routes/agents.js';
import skillRoutes from './routes/skills.js';
import configContentRoutes from './routes/configs.js';
import statsRoutes from './routes/stats.js';
import topicRoutes from './routes/topics.js';
import searchRoutes from './routes/search.js';
import { validateRootMiddleware } from './middleware/validate-root.js';
import { errorHandler } from './middleware/error-handler.js';
import { initFileWatcher } from './services/file-watcher.js';
import { searchIndex } from './services/search-index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../dist');

/**
 * Creates the Express application with all middleware and routes.
 * Does NOT start listening — caller controls the HTTP server lifecycle.
 */
export function createApp(): express.Application {
  const app = express();

  // ─── Middleware ──────────────────────────────────────────────────────────────

  // CORS — allow browser requests from localhost
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
    }
    next();
  });

  // Parse JSON request bodies (10mb limit for migration uploads per SRS)
  app.use(express.json({ limit: '10mb' }));

  // ─── API Routes ──────────────────────────────────────────────────────────────

  // Config routes (no data root validation needed — these SET the data root)
  app.use('/api/config', configRoutes);

  // Session routes (require valid data root)
  app.use('/api/sessions', validateRootMiddleware, sessionRoutes);

  // Migration routes (no data root validation — migration SETS up the data root)
  app.use('/api/migrate', migrationRoutes);

  // Content routes (require valid data root)
  app.use('/api/agents', validateRootMiddleware, agentRoutes);
  app.use('/api/skills', validateRootMiddleware, skillRoutes);
  app.use('/api/configs', validateRootMiddleware, configContentRoutes);
  app.use('/api/stats', validateRootMiddleware, statsRoutes);
  app.use('/api/topics', validateRootMiddleware, topicRoutes);
  app.use('/api/search', validateRootMiddleware, searchRoutes);

  // ─── Error Handler ───────────────────────────────────────────────────────────

  // Must be registered before static file serving
  app.use(errorHandler);

  // ─── Static File Serving ─────────────────────────────────────────────────────

  // Serve the React app build output
  app.use(express.static(clientDist));

  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  return app;
}

/**
 * Creates and configures the full server (app + HTTP server + file watcher + search index).
 * Does NOT start listening — caller calls httpServer.listen() to control lifecycle.
 */
export async function createServer(options: { port?: number } = {}): Promise<{ app: express.Application; httpServer: http.Server }> {
  const app = createApp();
  const httpServer = http.createServer(app);

  // Initialize file watcher with WebSocket support
  initFileWatcher(httpServer);

  // Build initial search index
  searchIndex.build().catch(err => console.error('Failed to build search index:', err));

  return { app, httpServer };
}

// ─── Legacy Entry Point ────────────────────────────────────────────────────────
// When run directly via `npx tsx index.ts`, auto-start the server.
// When imported by the CLI, only the exported functions are used.

const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('index.ts') ||
  process.argv[1].endsWith('index.js')
);

if (isDirectRun) {
  createServer().then(({ httpServer }) => {
    const port = config.port;
    const host = config.host;
    httpServer.listen(port, host, () => {
      console.log(`🚀 AKL's Knowledge server running at http://${host}:${port}`);
      console.log(`   Data root: ${getDataRoot() ?? '(not configured)'}`);
      console.log(`   Static files: ${clientDist}`);
      console.log(`   WebSocket: ws://${host}:${port}/ws/files`);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default createApp;
