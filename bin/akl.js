#!/usr/bin/env node

/**
 * akl — AKL's Knowledge CLI
 *
 * Usage:
 *   akl                  Start server on port 3001, open browser
 *   akl --port 4000      Start on custom port
 *   akl --no-open        Start server without opening browser
 *   akl --data-root /p   Use custom data root directory
 *   akl --help           Show usage information
 *   akl --version        Show version
 */

import { parseArgs, printHelp, printVersion } from '../cli/lib/args.js';
import { checkPort, probeAklServer } from '../cli/lib/port-check.js';
import { startServer } from '../cli/lib/server.js';
import { openBrowser } from '../cli/lib/browser.js';
import { setupShutdown } from '../cli/lib/shutdown.js';

const args = parseArgs(process.argv.slice(2));

// --help takes precedence over all other flags
if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.version) {
  printVersion();
  process.exit(0);
}

const port = args.port || 3001;

// Check if port is already in use
const portInUse = await checkPort(port);

if (portInUse) {
  // Distinguish AKL server from other processes via HTTP probe
  const isAkl = await probeAklServer(port);

  if (isAkl) {
    // AKL server already running — just open browser
    await openBrowser(port);
    process.exit(0);
  } else {
    // Different process holds the port
    console.error(`Port ${port} is already in use. Use --port to specify a different port.`);
    process.exit(2);
  }
}

// Start the server
const server = await startServer({ port, dataRoot: args.dataRoot });

// Open browser unless --no-open
if (!args.noOpen) {
  await openBrowser(port);
}

// Set up graceful shutdown
setupShutdown(server);
