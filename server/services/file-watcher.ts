import chokidar from 'chokidar';
import { WebSocketServer, WebSocket } from 'ws';
import { getDataRoot } from '../config.js';
import { searchIndex } from './search-index.js';
import path from 'path';

let wss: WebSocketServer | null = null;
let watcher: chokidar.FSWatcher | null = null;

export function initFileWatcher(server: any): void {
  wss = new WebSocketServer({ server, path: '/ws/files' });

  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
  });

  const dataRoot = getDataRoot();
  if (!dataRoot) return;

  watcher = chokidar.watch(dataRoot, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
  });

  let rebuildTimeout: ReturnType<typeof setTimeout> | null = null;

  const broadcast = (event: string, filePath: string) => {
    const relativePath = path.relative(dataRoot, filePath);
    const contentType = relativePath.split(path.sep)[0] || 'unknown';
    const message = JSON.stringify({
      type: 'file_change',
      event,
      path: relativePath,
      contentType,
      timestamp: new Date().toISOString(),
    });

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }

    // Debounce search index rebuild
    if (rebuildTimeout) clearTimeout(rebuildTimeout);
    rebuildTimeout = setTimeout(() => {
      searchIndex.build().catch(err => console.error('Search index rebuild failed:', err));
    }, 1000);
  };

  watcher
    .on('add', (filePath) => broadcast('add', filePath))
    .on('change', (filePath) => broadcast('change', filePath))
    .on('unlink', (filePath) => broadcast('unlink', filePath));

  console.log(`👀 File watcher active: ${dataRoot}`);
}

export function getWatcherStatus(): { watching: boolean; path: string | null } {
  return {
    watching: watcher !== null,
    path: getDataRoot(),
  };
}
