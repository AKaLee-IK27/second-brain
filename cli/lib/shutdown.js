/**
 * Graceful shutdown handler.
 *
 * Listens for SIGINT (Ctrl+C) and SIGTERM, closes the HTTP server,
 * WebSocket connections, and file watcher cleanly.
 */

/**
 * Sets up graceful shutdown handlers for the given HTTP server.
 * @param {import('http').Server} httpServer - The server to shut down
 */
export function setupShutdown(httpServer) {
  const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    httpServer.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
    // Force exit after 5 seconds if graceful shutdown hangs
    setTimeout(() => {
      console.error('Forced shutdown after 5s timeout.');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
