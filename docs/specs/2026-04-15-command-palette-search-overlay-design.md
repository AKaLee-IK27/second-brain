# Design: Command Palette Search Overlay

**Date:** 2026-04-15
**Status:** Approved
**Author:** Orchestrator
**Related Requirement:** `docs/ai/requirements/command-palette-search-overlay.md`

## Architecture

Replace the inline `SearchBar` in TopBar with a centered overlay Command Palette that unifies server-side search (sessions, agents, skills, topics, configs) with local notes search and command execution.

## Component Changes

### 1. `TopBar.tsx` — Search Trigger Button

**Before:**
```tsx
<div className="flex-1 max-w-xl mx-4">
  <SearchBar />
</div>
```

**After:**
```tsx
<button
  onClick={() => setCommandPaletteOpen(true)}
  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant/15 
             bg-surface-container-lowest hover:border-primary/30 transition-colors"
>
  <MaterialIcon name="search" size={16} className="text-outline-variant" />
  <span className="text-sm text-outline-variant">Search...</span>
  <kbd className="text-[10px] text-outline-variant bg-surface-container-high border 
                  border-outline-variant/30 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
</button>
```

### 2. `CommandPalette.tsx` — Unified Search Extension

**Current state:** Only searches local notes via `searchEngine.search()`.

**Changes:**
- Add `useDebounce` hook for server API calls (200ms)
- Add `api.search.query()` call for server-side content
- Merge results into unified list with section grouping
- Add routing logic for server content types (sessions, agents, skills, topics, configs)
- Prefix command labels with `>` symbol (e.g., `> New Note`, `> Toggle Sidebar`)
- Keep existing local notes search and recent notes display

**Result structure:**
```typescript
type PaletteItem = 
  | { type: 'command'; id: string; label: string; shortcut: string; action: () => void }
  | { type: 'note'; id: string; title: string; paraCategory: string }
  | { type: 'session' | 'agent' | 'skill' | 'topic' | 'config'; id: string; title: string; category?: string; slug?: string }
```

**Section rendering order:**
1. Commands (always shown, prefixed with `>`)
2. Notes (when query exists or recent notes available)
3. Sessions (when query returns results)
4. Agents (when query returns results)
5. Skills (when query returns results)
6. Topics (when query returns results)
7. Configs (when query returns results)

### 3. `App.tsx` — Mount CommandPalette

Add conditional render:
```tsx
{commandPaletteOpen && <CommandPalette />}
```

### 4. `SearchBar.tsx` — Delete

Remove file entirely. All functionality moved to CommandPalette.

## Data Flow

```
User types → 200ms debounce → Parallel:
  ├─ searchEngine.search(query) → local notes
  └─ api.search.query({ query, limit: 10 }) → server content
       ↓
  Merge results → Group by type → Display sections
```

## Keyboard Navigation

- `↑/↓`: Move active selection across all items (single index)
- `Enter`: Activate selected item (navigate or execute command)
- `Escape`: Close overlay (handled by `useKeyboardShortcuts.ts`)
- `⌘K/Ctrl+K`: Toggle overlay (handled by `useKeyboardShortcuts.ts`)

## Visual Design

- Backdrop: `bg-black/40 backdrop-blur-sm`
- Panel: `bg-surface-container/90 backdrop-blur-xl border border-outline-variant/20 rounded-xl shadow-2xl`
- Input: `>` prefix in `primary` color, placeholder "Search knowledge or run commands..."
- Active item: `bg-primary/10 border-l-2 border-primary`
- Section headers: `font-mono text-[10px] text-outline-variant uppercase tracking-widest`
- Footer: Navigation hints + result count

## Decisions Confirmed

| Decision | Value |
|----------|-------|
| Search result limit | 10 (server API) |
| Command prefix | `>` symbol |
| Recent notes count | 5 |
| Command filtering | Commands always shown, not filtered by query |

## Files Modified

| File | Change |
|------|--------|
| `src/components/layout/TopBar.tsx` | Replace SearchBar with trigger button |
| `src/components/search/CommandPalette.tsx` | Extend with server-side search, `>` prefix |
| `src/routes/App.tsx` | Mount CommandPalette conditionally |
| `src/components/search/SearchBar.tsx` | Delete |
