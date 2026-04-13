/**
 * Browser opener.
 *
 * Opens the system default browser to the server URL.
 * Uses platform-specific commands (no external dependency).
 */

import { exec } from 'child_process';
import { platform } from 'os';

/**
 * Opens the default browser to AKL's Knowledge.
 * @param {number} port - The port the server is running on
 */
export async function openBrowser(port) {
  const url = `http://127.0.0.1:${port}`;
  const cmd = getOpenCommand(url);

  try {
    await execPromise(cmd);
  } catch {
    console.warn(`Could not open browser. Navigate to ${url} manually.`);
  }
}

function getOpenCommand(url) {
  const plat = platform();
  switch (plat) {
    case 'darwin':
      return `open "${url}"`;
    case 'win32':
      return `start "" "${url}"`;
    default: // Linux and others
      return `xdg-open "${url}"`;
  }
}

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
