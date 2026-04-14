# AKL's Knowledge

A read-only React dashboard that visualizes opencode AI session data — agents, skills, configs, sessions, and topics — from local markdown files. Content is created by the [opencode](https://opencode.ai) CLI; this app is the discovery and visualization layer.

## Features

- **Session Browser** — Timeline view of all opencode conversations with token usage, cost tracking, and full conversation replay
- **Agent & Skill Roster** — Browse your AI team definitions, capabilities, and usage history
- **Topic Library** — Organized knowledge articles, blogs, and research notes
- **Knowledge Graph** — Unified graph view connecting sessions, topics, agents, and skills
- **Knowledge Extraction** — Auto-extracted key findings, files modified, and next steps from sessions
- **Backlink Navigation** — Cross-entity relationship discovery (related sessions, source sessions, agents/skills used)
- **Full-Text Search** — Fuse.js powered search across all content types
- **Live File Updates** — WebSocket-powered real-time refresh when markdown files change
- **Notes** — Rich text notes with TipTap editor, persisted in IndexedDB
- **Migration** — Import existing SQLite opencode sessions into the markdown-based format

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  AKL's Knowledge Dashboard                │
│                      (React Web App)                      │
├─────────────────────────┬───────────────────────────────┤
│  Frontend (React SPA)   │  Backend (Express API)         │
│  - Vite + React 19      │  - Express + better-sqlite3    │
│  - Tailwind CSS 4       │  - chokidar file watcher       │
│  - Zustand (state)      │  - WebSocket live updates      │
│  - Dexie (IndexedDB)    │  - Markdown parser + extractor │
│  - TipTap (rich text)   │  - Fuse.js search index        │
│  - React Router 7       │                                │
│  - d3 (graph viz)       │                                │
└─────────────────────────┴───────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Data Root Folder │
                    │  (local markdown)  │
                    │  sessions/ agents/  │
                    │  skills/ topics/    │
                    │  configs/           │
                    └─────────────────────┘
```

## Quick Start

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start the full app (builds + serves on port 3001)
npm run akl

# Or develop frontend only (hot reload)
npm run dev
```

The app opens at `http://127.0.0.1:3001`.

## Developer Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (frontend only) |
| `npm run build` | Typecheck + build SPA to `dist/` |
| `npm run preview` | Serve built SPA locally |
| `npm run akl` | Start full app (port 3001, opens browser) |
| `npm run seed` | Seed sample notes for development |
| `npm test` | Run Vitest (watch mode) |
| `npm run test:coverage` | Run tests with v8 coverage |
| `cd server && npm run dev` | Start backend API with `tsx watch` |
| `cd server && npm run typecheck` | Typecheck backend only |

## CLI Options

```bash
akl                  # Start on port 3001, open browser
akl --port 4000      # Custom port
akl --no-open        # Don't open browser
akl --data-root /p   # Custom data root directory
akl --help           # Show usage
akl --version        # Show version
```

## Data Root

The **data root** is the local directory containing your markdown knowledge files. It is configured via:

1. `server/.data-root.json` (persisted configuration)
2. `--data-root` CLI flag (override)
3. Default: `~/akl-knowledge`

### Data Root Structure

```
{data-root}/
├── sessions/YYYY-MM/    # Session files (monthly buckets)
├── agents/              # Agent definitions
├── skills/              # Skill definitions
├── topics/{category}/   # Knowledge articles
└── configs/             # Configuration snapshots
```

All files use YAML frontmatter for metadata. See [OMC Knowledge Architecture](docs/specs/2025-04-12-omc-knowledge-architecture.md) for the complete schema.

## API

The Express server exposes REST endpoints under `/api/`:

| Route | Description |
|-------|-------------|
| `/api/config` | Data root configuration |
| `/api/vaults` | Vault management |
| `/api/migrate` | SQLite → markdown migration |
| `/api/sessions` | Session listing and detail |
| `/api/agents` | Agent roster and detail |
| `/api/skills` | Skill catalog and detail |
| `/api/configs` | Configuration snapshots |
| `/api/topics` | Topic library and detail |
| `/api/stats` | Aggregated usage statistics |
| `/api/search` | Full-text search |
| `/api/knowledge` | Extracted knowledge snippets |
| `/api/graph` | Unified knowledge graph data |
| `/api/backlinks` | Cross-entity backlinks |

All routes except `/api/config`, `/api/vaults`, and `/api/migrate` require a valid data root. The API binds to `127.0.0.1` only.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS 4 |
| **State** | Zustand (app/UI), Dexie/IndexedDB (notes) |
| **Routing** | React Router 7 |
| **Rich Text** | TipTap |
| **Graph** | d3 |
| **Search** | Fuse.js |
| **Backend** | Express, TypeScript (tsx) |
| **Database** | better-sqlite3 (migration only) |
| **File Watch** | chokidar + WebSocket |
| **Testing** | Vitest + Testing Library + jsdom |

## Project Structure

```
├── bin/akl.js           # CLI entry point
├── cli/lib/             # CLI utilities (args, port-check, server, shutdown)
├── server/              # Express API server
│   ├── index.ts         # createApp() + createServer() exports
│   ├── config.ts        # Data root + vault configuration
│   ├── routes/          # API route handlers
│   ├── services/        # File watcher, parser, extractor, search
│   ├── middleware/      # Validation + error handling
│   └── types/           # TypeScript type definitions
├── src/                 # React frontend
│   ├── main.tsx         # App entry point
│   ├── routes/          # Page components
│   ├── components/      # Reusable UI components
│   ├── state/           # Zustand stores
│   ├── storage/         # Dexie/IndexedDB repositories
│   ├── services/        # API client
│   ├── core/            # Note + search logic
│   ├── editor/          # TipTap editor config
│   └── hooks/           # Custom React hooks
├── test/                # Vitest tests
│   └── server/          # Backend integration tests
├── scripts/             # Utility scripts (seed-notes)
└── docs/                # Design specs and architecture docs
```

## Testing

```bash
npm test                    # Watch mode
npm test -- -t "pattern"    # Run specific test
npm run test:coverage       # With v8 coverage report
```

Tests use Vitest with jsdom environment. Test files live in `test/**/*.test.{ts,tsx}`.

## Design Specs

Active design specifications are in `docs/specs/`. Reference them before adding features to avoid duplicating planned work:

- [OpenCode Hub & Knowledge Flow](docs/specs/2026-04-13-opencode-hub-and-knowledge-flow-design.md)
- [Multi-Folder Vault Design](docs/specs/2026-04-13-multi-folder-vault-design.md)
- [Knowledge Creator Agent](docs/specs/2026-04-14-knowledge-creator-agent-design.md)

## License

Private — all rights reserved.
