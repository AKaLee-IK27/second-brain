/**
 * Server starter.
 *
 * Imports the Express server factory, applies CLI overrides (port, data root),
 * and starts the HTTP server.
 */

import fs from 'fs';
import { createServer } from '../../server/index.js';
import { setDataRoot } from '../../server/config.js';

/**
 * Validates that a data root path exists and is writable.
 * @param {string} dataRoot - The path to validate
 * @returns {{ valid: boolean; error?: string }}
 */
function validateDataRoot(dataRoot) {
  if (!fs.existsSync(dataRoot)) {
    return { valid: false, error: `Data root directory not found: ${dataRoot}` };
  }
  try {
    fs.accessSync(dataRoot, fs.constants.R_OK | fs.constants.W_OK);
  } catch {
    return { valid: false, error: `Data root directory is not writable: ${dataRoot}` };
  }
  return { valid: true };
}

/**
 * Starts the AKL's Knowledge server.
 * @param {Object} options
 * @param {number} options.port - Port to listen on
 * @param {string} [options.dataRoot] - Optional data root override
 * @returns {Promise<import('http').Server>} The HTTP server instance
 */
export async function startServer({ port, dataRoot }) {
  // Apply and validate data root override if provided
  if (dataRoot) {
    const validation = validateDataRoot(dataRoot);
    if (!validation.valid) {
      console.error(validation.error);
      process.exit(1);
    }
    setDataRoot(dataRoot);
  }

  // Create the server (app + httpServer, not yet listening)
  const { httpServer } = await createServer({ port });

  // Start listening
  await new Promise((resolve, reject) => {
    httpServer.listen(port, '127.0.0.1', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  console.log(`🚀 AKL's Knowledge server running at http://127.0.0.1:${port}`);

  return httpServer;
}
