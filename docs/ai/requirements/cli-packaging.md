# Requirement: CLI Packaging (`akl` command)

**Date:** 2026-04-12
**Status:** Draft
**Author:** scribe

## User Stories

### Primary
As a developer, I want to run `akl` in my terminal so that the OMC Dashboard server starts automatically and the web app opens in my default browser.

### Help & Discovery
As a new user, I want to run `akl --help` so that I can discover all available flags and their usage.

### Customization
As a power user, I want to override the default port and data root via CLI flags so that I can run multiple instances or use a different data directory.

## Acceptance Criteria

### Core Functionality
- [ ] Given the user has installed the package, when they run `akl` in any terminal, then the server starts on port 3001 and the CLI invokes the system default browser to navigate to `http://127.0.0.1:3001` within 2 seconds of server readiness
- [ ] Given the server is already running on port 3001, when the user runs `akl`, then the CLI detects the running instance via port probe and only opens the browser without starting a duplicate server
- [ ] Given the user has installed the package, when they run `akl --port 4000`, then the server starts on port 4000 instead of the default 3001
- [ ] Given the user has installed the package, when they run `akl --no-open`, then the server starts and the CLI does not invoke the browser
- [ ] Given the user has installed the package, when they run `akl --data-root /path/to/data`, then the server uses `/path/to/data` as the data root instead of the value in `server/.data-root.json`

### Help & Version
- [ ] Given the user runs `akl --help`, then the CLI prints usage information listing all available flags (`--port`, `--no-open`, `--data-root`, `--help`, `--version`) and exits with code 0
- [ ] Given the user runs `akl --version`, then the CLI prints the current version string (e.g., `akl v0.1.0`) and exits with code 0

### Graceful Shutdown
- [ ] Given the user presses Ctrl+C while `akl` is running, then the server shuts down gracefully (closes HTTP server, WebSocket connections, and file watcher) and the CLI exits with code 0

### Error Handling
- [ ] Given port 3001 is already in use by a non-OMC process, when the user runs `akl`, then the CLI prints an error message "Port 3001 is already in use. Use --port to specify a different port." and exits with code 2
- [ ] Given the user provides a `--data-root` path that does not exist, when the user runs `akl`, then the CLI prints an error message "Data root directory not found: <path>" and exits with code 1
- [ ] Given the user provides a `--data-root` path that exists but is not writable, when the user runs `akl`, then the CLI prints an error message "Data root directory is not writable: <path>" and exits with code 1
- [ ] Given the server fails to start (e.g., missing dependencies, corrupt build), when the user runs `akl`, then the CLI prints the error output and exits with code 1
- [ ] Given the system default browser fails to open, when the user runs `akl`, then the CLI prints a warning message "Could not open browser. Navigate to http://127.0.0.1:3001 manually." and continues running the server
- [ ] Given the user runs `akl --help --port 4000`, when the CLI processes the flags, then the CLI prints usage information and exits with code 0, ignoring the `--port` flag
- [ ] Given the user requests a privileged port (e.g., `akl --port 80`) without sufficient permissions, when the user runs `akl`, then the CLI prints an error message "Permission denied: cannot bind to port 80. Use a port number above 1024 or run with elevated privileges." and exits with code 2

### Performance
- [ ] Given the user runs `akl`, when the CLI starts, then the server accepts HTTP connections within 3 seconds
- [ ] Given the server is running, when the user makes an API request, then the response time is under 200ms for the sessions list endpoint
- [ ] Given the CLI is running with 320 sessions indexed, when the process is measured, then the memory usage is under 150MB

## Constraints

| ID | Constraint | Verification Method |
|----|------------|---------------------|
| C1 | The CLI MUST be installable globally via `npm install -g` | `npm install -g` succeeds and `akl --version` works |
| C2 | The CLI MUST work on macOS, Linux, and Windows | Tested on all three platforms |
| C3 | The CLI package MUST embed the contents of `dist/` as static assets served by the Express server | `akl` serves the React app without requiring a separate build step |
| C4 | Node.js is required for `npm install -g` (inherent to npm). After installation, the CLI uses the Node.js runtime available in the user's PATH. No additional Node.js setup beyond the initial `npm install -g` is required. | `akl` runs after `npm install -g` without additional configuration |
| C5 | The server MUST bind to 127.0.0.1 only | `netstat` or `lsof` shows listener on 127.0.0.1, not 0.0.0.0 |
| C6 | The CLI-started server MUST support CORS for localhost origins, WebSocket connections at `/ws/files`, file watcher via chokidar, and search index via Fuse.js — matching the current `npx tsx index.ts` behavior | All four features tested via API calls and WebSocket connection after `akl` starts |

## Out of Scope
- GUI desktop application (Electron/Tauri) — CLI only
- Auto-updating mechanism
- Configuration file management via CLI (beyond `--data-root` and `--port`)
- Plugin system or extensibility
- Authentication or multi-user support
- Standalone binary distribution (no native compilation — npm only for v1)
- Background daemon mode (server runs in foreground, exits on Ctrl+C)

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success (server started, or `--help`/`--version` displayed) |
| 1 | General error (invalid arguments, missing data root, server crash) |
| 2 | Port conflict (requested port already in use) |

## Related Decisions
- Server currently runs via `cd server && npx tsx index.ts` — this will be replaced by the `akl` command
- Data root persistence is handled via `server/.data-root.json` — the CLI MUST read and use this file when `--data-root` is not provided
- CORS middleware is configured to allow `localhost` origins — this MUST remain intact in the CLI-packaged server
- The server uses Express + HTTP server + WebSocket — the CLI MUST start the same server process with identical configuration
