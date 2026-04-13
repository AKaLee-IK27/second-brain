/**
 * Port availability checker and AKL server probe.
 *
 * checkPort(port) — Returns true if port is in use, false if free.
 * probeAklServer(port) — Returns true if an AKL server is running on the port.
 */

import net from 'net';
import http from 'http';

/**
 * Checks if a port is already in use by attempting to bind to it.
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} true if port is in use, false if free
 */
export function checkPort(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(true)) // Port in use
      .once('listening', () => {
        tester.close();
        resolve(false); // Port free
      })
      .listen(port, '127.0.0.1');
  });
}

/**
 * Probes a port to check if an AKL server is running.
 * Makes an HTTP GET to /api/config/data-root and checks for a valid AKL response.
 * @param {number} port - The port to probe
 * @returns {Promise<boolean>} true if AKL server detected, false otherwise
 */
export async function probeAklServer(port) {
  return new Promise((resolve) => {
    const req = http.get(
      `http://127.0.0.1:${port}/api/config/data-root`,
      { timeout: 2000 },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            // Valid AKL response has success: true and data.path (string or null)
            resolve(
              json.success === true &&
                json.data &&
                typeof json.data.path !== 'undefined'
            );
          } catch {
            resolve(false);
          }
        });
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}
