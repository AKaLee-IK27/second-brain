# Design: Multi-Folder Vault (Phase 1 — Manual Sync with Diff Preview)

**Date:** 2026-04-13
**Status:** Draft — Awaiting Approval
**Author:** Orchestrator (with Oracle consultation)

---

## 1. Problem Statement

When the user updates config files in `~/.config/opencode/`, they must manually copy those changes to each project folder. This is error-prone, time-consuming, and leads to config drift across projects.

## 2. Solution Overview

Add a "vault" system to AKL's Knowledge that:
- Registers multiple project folders as sync targets ("vaults")
- Shows a diff preview of what would change before syncing
- Pushes configs from `~/.config/opencode/` (single source of truth) to all registered vaults
- Vaults are scoped per-data-root (changing data root = different vault list)

## 3. Architecture

### 3.1 Data Model

**Vault storage** — Added to `server/.data-root.json`:

```json
{
  "dataRoot": "/Users/khoi.le/akl-knowledge",
  "vaults": [
    {
      "id": "vault-1",
      "path": "/Users/khoi.le/project-a/.opencode",
      "name": "project-a",
      "addedAt": "2026-04-13T10:00:00Z"
    },
    {
      "id": "vault-2",
      "path": "/Users/khoi.le/project-b/.opencode",
      "name": "project-b",
      "addedAt": "2026-04-13T10:05:00Z"
    }
  ]
}
```

**Vault type** (`server/types/vault.ts`):

```typescript
interface Vault {
  id: string;          // Unique ID (uuid or timestamp-based)
  path: string;        // Absolute path to the vault folder
  name: string;        // Display name (auto-derived from folder name)
  addedAt: string;     // ISO timestamp
}
```

**Sync diff type** (`server/types/sync.ts`):

```typescript
interface FileDiff {
  sourcePath: string;      // e.g., ~/.config/opencode/opencode.jsonc
  targetPath: string;      // e.g., /project-a/.opencode/opencode.jsonc
  status: 'new' | 'modified' | 'unchanged' | 'deleted';
  sourceHash?: string;     // SHA-256 of source content
  targetHash?: string;     // SHA-256 of existing target content (if exists)
  sourceSize?: number;
  targetSize?: number;
}

interface VaultDiff {
  vaultId: string;
  vaultName: string;
  vaultPath: string;
  files: FileDiff[];
  summary: {
    new: number;
    modified: number;
    unchanged: number;
    deleted: number;
    totalChanges: number;
  };
}

interface SyncPreview {
  sourceRoot: string;
  vaults: VaultDiff[];
  totalFiles: number;
  totalChanges: number;
}
```

### 3.2 API Endpoints

| Method | Path | Purpose | Request Body | Response |
|--------|------|---------|-------------|----------|
| `GET` | `/api/vaults` | List registered vaults | — | `{ vaults: Vault[] }` |
| `POST` | `/api/vaults` | Add a new vault | `{ path: string }` | `{ vault: Vault }` |
| `DELETE` | `/api/vaults/:id` | Remove a vault | — | `{ success: true }` |
| `POST` | `/api/vaults/preview` | Compute diff preview | — | `SyncPreview` |
| `POST` | `/api/vaults/sync` | Execute sync | — | `{ success: N, failed: M, errors: [] }` |

### 3.3 Server-Side Components

```
server/
├── types/
│   ├── vault.ts          # Vault, FileDiff, VaultDiff, SyncPreview types
│   └── sync.ts           # Sync result types
├── services/
│   ├── vault-manager.ts  # CRUD for vaults, persistence to .data-root.json
│   ├── sync-engine.ts    # Diff computation, file sync, atomic writes
│   └── file-hasher.ts    # SHA-256 hashing for change detection
└── routes/
    └── vaults.ts         # Express route handlers for all vault endpoints
```

### 3.4 Frontend Components

```
src/
├── components/
│   └── vaults/
│       ├── VaultManager.tsx      # Vault list, add/remove UI
│       ├── SyncPreviewModal.tsx  # Diff preview dialog
│       ├── FileDiffRow.tsx       # Single file diff display
│       └── VaultDiffSection.tsx  # Per-vault diff summary
├── routes/
│   └── ConfigsPage.tsx           # Modified: add sync button + vault manager
└── services/
    └── api.ts                    # Modified: add vault API methods
```

## 4. User Flow

### 4.1 Adding a Vault

```
User opens Configs page
    ↓
Scrolls to "Managed Vaults" section at bottom
    ↓
Clicks "+ Add Vault"
    ↓
File picker dialog opens (or paste path)
    ↓
User selects/enters folder path
    ↓
Server validates: path exists, is directory, is writable
    ↓
Vault added to list with auto-derived name
```

### 4.2 Previewing Sync

```
User clicks "Preview Sync" button (enabled when vaults exist)
    ↓
Modal opens, shows loading state
    ↓
Server computes diffs for all vaults:
    1. Read all source configs from ~/.config/opencode/
    2. For each vault, compare file hashes
    3. Classify each file as new/modified/unchanged/deleted
    ↓
Modal displays:
    - Per-vault summary: "3 new, 2 modified, 5 unchanged"
    - Expandable file list with details
    - "Cancel" and "Confirm Sync" buttons
```

### 4.3 Executing Sync

```
User clicks "Confirm Sync" in preview modal
    ↓
For each vault:
    1. Create folder structure if missing
    2. For each changed file:
       a. Write to .tmp file
       b. Rename .tmp → actual file (atomic)
       c. Keep .bak of previous version
    3. Update lastSynced in markdown frontmatter
    ↓
Modal shows results: "Synced 5 configs to 2 vaults"
    ↓
On error: "Failed to sync to project-b: Permission denied"
    ↓
Modal closes, toast notification shown
```

## 5. Sync Details

### 5.1 What Gets Synced

All config files from `~/.config/opencode/` that are recognized OMC config types:

| Source | Target Structure |
|--------|-----------------|
| `~/.config/opencode/opencode.jsonc` | `{vault}/opencode.jsonc` |
| `~/.config/opencode/agents/*.md` | `{vault}/agents/*.md` |
| `~/.config/opencode/skills/*.md` | `{vault}/skills/*.md` |
| `~/.config/opencode/themes/*.md` | `{vault}/themes/*.md` |
| `~/.config/opencode/environments/*.md` | `{vault}/environments/*.md` |

### 5.2 Atomic Write Strategy

```
1. Read source file content
2. If target exists, copy to .bak (overwrite previous .bak)
3. Write content to {filename}.tmp
4. Rename {filename}.tmp → {filename} (atomic on POSIX)
5. If any step fails, .bak is preserved for recovery
```

### 5.3 Change Detection

- **Hash-based comparison**: SHA-256 of file content
- **No metadata comparison**: Only content matters, not timestamps
- **Deleted files**: If source file no longer exists, mark as "deleted" in diff (do NOT delete from target automatically — user must confirm)

## 6. Error Handling

| Scenario | Behavior |
|----------|----------|
| Vault folder doesn't exist | Create it automatically during sync |
| Permission denied on vault | Show error in results, skip that vault, continue others |
| Source file missing | Skip with warning in diff preview |
| Write fails mid-sync | `.bak` preserved, error shown, user can retry |
| Invalid path on add | Server validates and returns error message |
| No vaults registered | Sync button disabled with tooltip "Add vaults first" |

## 7. UI Design

### 7.1 Configs Page (Modified)

```
┌──────────────────────────────────────────────────────────────┐
│  Configs                        [Preview Sync] [Manage Vaults] │
│  [Type: All ▼] [Scope: All ▼]                                │
├──────────────────────────────────────────────────────────────┤
│  📄 opencode.jsonc                                           │
│  📄 agents/orchestrator.md                                   │
│  📄 agents/explorer.md                                       │
│  ...                                                         │
├──────────────────────────────────────────────────────────────┤
│  Managed Vaults (2)                                          │
│  📁 project-a  /Users/khoi.le/project-a/.opencode      [✕]   │
│  📁 project-b  /Users/khoi.le/project-b/.opencode      [✕]   │
│  [+ Add Vault]                                               │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Sync Preview Modal

```
┌──────────────────────────────────────────────────────────────┐
│  Sync Preview                                          [✕]   │
├──────────────────────────────────────────────────────────────┤
│  Source: ~/.config/opencode/                                 │
│  Total changes: 5 files across 2 vaults                      │
│                                                              │
│  ▼ project-a (3 changes)                                     │
│    ✚ new       agents/new-agent.md                    2.1 KB │
│    ✎ modified  opencode.jsonc                         25 KB  │
│    ✎ modified  skills/researcher.md                   4.3 KB │
│                                                              │
│  ▼ project-b (2 changes)                                     │
│    ✚ new       agents/new-agent.md                    2.1 KB │
│    ✎ modified  opencode.jsonc                         25 KB  │
│                                                              │
│  [Cancel]                                    [Confirm Sync]  │
└──────────────────────────────────────────────────────────────┘
```

### 7.3 Vault Manager Modal

```
┌──────────────────────────────────────────────────────────────┐
│  Manage Vaults                                         [✕]   │
├──────────────────────────────────────────────────────────────┤
│  Vaults are scoped to the current data root.                 │
│  Changing data root will show a different vault list.        │
│                                                              │
│  📁 project-a                                                │
│     /Users/khoi.le/project-a/.opencode                       │
│     Added: Apr 13, 2026                              [Remove]│
│                                                              │
│  📁 project-b                                                │
│     /Users/khoi.le/project-b/.opencode                       │
│     Added: Apr 13, 2026                              [Remove]│
│                                                              │
│  [+ Add Vault]                                               │
│                                                              │
│  [Close]                                                     │
└──────────────────────────────────────────────────────────────┘
```

## 8. Out of Scope (Phase 1)

- ❌ Automatic sync on file change (Phase 2)
- ❌ Bidirectional sync (not planned)
- ❌ Selective file sync / exclude patterns
- ❌ Version history / rollback UI (`.bak` exists but no UI)
- ❌ Real-time file watching on vaults
- ❌ Sync scheduling
- ❌ Cloud sync

## 9. Implementation Order

1. Server: Vault types + vault-manager service
2. Server: File hasher service
3. Server: Sync engine (diff + sync)
4. Server: Vault routes
5. Frontend: Vault API methods in api.ts
6. Frontend: VaultManager component
7. Frontend: SyncPreviewModal component
8. Frontend: Integrate into ConfigsPage
9. Testing: Manual verification

## 10. Constraints

| Constraint | Detail |
|------------|--------|
| Platform | macOS only (user's environment) |
| Write scope | Only to registered vault paths, never to `~/.config/opencode/` |
| Data root scoping | Vaults stored per-data-root in `.data-root.json` |
| Atomic writes | Required for all file operations |
| No breaking changes | Existing API endpoints and UI must continue working |
