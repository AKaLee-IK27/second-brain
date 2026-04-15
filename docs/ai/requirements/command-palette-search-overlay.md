# Requirement: Command Palette Search Overlay

**Date:** 2026-04-15
**Status:** Draft
**Author:** Scribe

## User Story

As a user of Monolithic Lexicon, I want a centered overlay search panel (like VS Code Command Palette / macOS Spotlight) so that I have more space to search across all content types and execute commands directly without the cramped inline search bar in the TopBar.

## Problem Statement

The current `SearchBar` component in the TopBar has two issues:

1. **Icon overlay bug**: The search icon (left) and `⌘K` badge (right) visually overlap the "Search..." placeholder text because the input padding (`pl-9` = 36px) is insufficient for the icon container, and the inline dropdown is constrained by the TopBar width.

2. **Poor UX for discovery**: The inline dropdown provides limited space for results, no command execution capability, and feels cramped. An existing `CommandPalette` component was built but never integrated into the app — it only searches local notes, not server-side content (sessions, agents, skills, topics, configs).

## Acceptance Criteria

### A. Remove Inline SearchBar from TopBar
- [ ] Given the TopBar component, when it renders, then the inline `SearchBar` component is replaced with a search trigger button (search icon + `⌘K` badge) that opens the Command Palette overlay
- [ ] Given the search trigger button in the TopBar, when clicked, then the Command Palette overlay opens with the search input auto-focused
- [ ] Given the TopBar, when the Command Palette is open, then the search trigger button visually indicates the active state (e.g., highlighted background)

### B. Command Palette Overlay Opens Centered
- [ ] Given the Command Palette overlay, when opened via `⌘K` / `Ctrl+K` or clicking the TopBar search trigger, then it renders as a centered modal overlay with a backdrop blur (`bg-black/40 backdrop-blur-sm`)
- [ ] Given the Command Palette overlay, when rendered, then the panel is positioned at `items-start justify-center pt-24` (top-centered, not vertically centered) with `max-w-2xl` width
- [ ] Given the Command Palette overlay, when the backdrop is clicked, then the overlay closes
- [ ] Given the Command Palette overlay, when the `Escape` key is pressed, then the overlay closes and focus returns to the previous element

### C. Unified Search Across All Content Types
- [ ] Given the Command Palette search input, when the user types a query, then search results include all server-side content types: sessions, agents, skills, topics, and configs (via the existing `POST /api/search` API)
- [ ] Given the Command Palette search input, when the user types a query, then search results also include local notes (via the existing `searchEngine.search()` for IndexedDB notes)
- [ ] Given the Command Palette search input, when the query is empty, then the panel displays: (1) recent notes (last 5), and (2) available commands
- [ ] Given the Command Palette search results, when they render, then they are grouped by section: Commands, Notes, Sessions, Agents, Skills, Topics, Configs — with only non-empty sections shown
- [ ] Given the Command Palette search results, when a result is selected (click or Enter), then the app navigates to the appropriate detail page for that item (same routing logic as the current SearchBar)

### D. Command Execution
- [ ] Given the Command Palette, when the query is empty or matches a command, then the following commands are available: New Note, Toggle Sidebar, Toggle Right Panel, Toggle Focus Mode, Show Keyboard Shortcuts
- [ ] Given a command in the list, when selected (click or Enter), then the corresponding action executes and the overlay closes
- [ ] Given a command in the list, when rendered, then it displays the command label, an icon, and the keyboard shortcut hint (e.g., `⌘N`, `⌘\`)

### E. Keyboard Navigation
- [ ] Given the Command Palette is open, when the user presses `ArrowDown`, then the active selection moves to the next item (wrapping not required)
- [ ] Given the Command Palette is open, when the user presses `ArrowUp`, then the active selection moves to the previous item (stops at 0)
- [ ] Given the Command Palette is open, when the user presses `Enter`, then the currently selected item is activated (navigate to result or execute command)
- [ ] Given the Command Palette is open, when the user presses `Escape`, then the overlay closes
- [ ] Given the Command Palette is closed, when the user presses `⌘K` / `Ctrl+K`, then the overlay opens with the input focused

### F. Visual Design
- [ ] Given the Command Palette panel, when rendered, then it uses the Monolithic Lexicon design tokens: `bg-surface-container/90 backdrop-blur-xl`, `border-outline-variant/20`, `rounded-xl`, `shadow-2xl`
- [ ] Given the search input in the Command Palette, when rendered, then it displays a `>` prefix in `primary` color, placeholder text "Search knowledge or run commands...", and `font-headline` typography at `text-lg`
- [ ] Given an active/selected result item, when rendered, then it displays with `bg-primary/10` background and `border-l-2 border-primary` left border
- [ ] Given the Command Palette footer, when rendered, then it displays navigation hints (↑↓ Navigate, ↵ Open) on the left and result count on the right, using `font-mono text-[10px] text-outline-variant`
- [ ] Given the loading state during search, when rendered, then it displays "Searching..." in a centered monospace text with `text-outline-variant` color
- [ ] Given the empty results state, when rendered, then it displays "No results found" in a centered monospace text with `text-outline-variant` color

### G. Search Input Behavior
- [ ] Given the Command Palette is open, when the user types, then search results update with debounced API calls (200ms debounce, matching the current SearchBar behavior)
- [ ] Given the Command Palette is open, when the search API returns an error, then an error message is displayed in `text-error` color
- [ ] Given the Command Palette is open, when the search query is cleared, then results reset to the default view (recent notes + commands)

## Constraints

### Technical
- Must reuse the existing `CommandPalette` component at `src/components/search/CommandPalette.tsx` as the starting point
- Must reuse the existing server search API (`POST /api/search`) for server-side content
- Must reuse the existing client-side `searchEngine` (`src/core/search/search-engine.ts`) for local notes
- Must reuse the existing `useUIStore` state (`commandPaletteOpen`, `setCommandPaletteOpen`)
- Must reuse the existing keyboard shortcut handler in `useKeyboardShortcuts.ts` (`⌘K` / `Ctrl+K`)
- The existing `SearchBar` component at `src/components/search/SearchBar.tsx` must be removed from the TopBar (can be deleted entirely since CommandPalette replaces it)
- Must maintain the existing 200ms debounce for API search calls
- Must not modify the server-side search index or API routes

### Design
- Must follow the Monolithic Lexicon design system (dark theme, Space Grotesk / Space Mono / Literata typography)
- The overlay must match the existing CommandPalette mockup from the Stitch design (Screen 9 in `monolithic-lexicon-ui-overhaul.md`)
- The `>` prefix in the search input must use `primary` color (`#a2c9ff`)
- Result grouping headers must use `font-mono`, `text-[10px]`, `text-outline-variant`, `uppercase`, `tracking-widest`

### Performance
- The search API call must not block the UI — loading state must be shown during fetch
- The overlay must open within 200ms of trigger (instant state change, no async loading for the panel itself)

## Edge Cases

- **No data root configured**: If the server has no data root, the search should gracefully show "No data available" instead of erroring
- **Search API slow**: If the API takes longer than 2 seconds, a "Still searching..." message should appear
- **Very long result titles**: Titles longer than the panel width should be truncated with ellipsis
- **Duplicate results**: If a note and a server item have the same title, they should be distinguishable by their section grouping and icon
- **Rapid typing**: The debounce must prevent excessive API calls when the user types quickly
- **Network error**: If the search API fails, the error should be displayed inline without closing the overlay

## Out of Scope

- Adding new search algorithms or replacing Fuse.js
- Adding search result highlighting (matched text highlighting)
- Adding search filters (type filter, date filter) within the Command Palette
- Adding command arguments or parameterized commands (e.g., "Go to session: <id>")
- Adding search history or saved searches
- Adding fuzzy command matching (commands are always shown, not filtered by query)
- Mobile-responsive adaptations (desktop-first)
- Light theme support
- Modifying the server-side search index structure or API contracts
- Adding real-time search result preview (e.g., showing content snippet on hover)

## Related Decisions

- **Monolithic Lexicon UI Overhaul** (`docs/ai/requirements/monolithic-lexicon-ui-overhaul.md`): Section L (Command Palette) defines the original design requirements for the Command Palette component. This requirement extends it by integrating server-side search and replacing the inline SearchBar.
- **Search System Design** (`docs/ai/design/search-system.md`): Documents the existing server-side search architecture (Fuse.js, search-index.ts, POST /api/search). The Command Palette will consume this existing API.
- **New Design System** (`docs/ai/requirements/new-design-system.md`): Superseded by Monolithic Lexicon UI Overhaul.

## Implementation Notes

### Files to Modify
| File | Change |
|------|--------|
| `src/components/layout/TopBar.tsx` | Replace `<SearchBar />` with a search trigger button |
| `src/components/search/CommandPalette.tsx` | Extend to include server-side search results (sessions, agents, skills, topics, configs) |
| `src/components/search/SearchBar.tsx` | Remove from TopBar import; delete file |
| `src/routes/App.tsx` | Add `<CommandPalette />` conditional render (currently missing) |

### Current State Summary
- `CommandPalette` component exists at `src/components/search/CommandPalette.tsx` but is **never imported or rendered** in the app
- `CommandPalette` currently only searches local notes (IndexedDB), not server-side content
- `SearchBar` at `src/components/search/SearchBar.tsx` is the active search component in the TopBar
- Keyboard shortcut `⌘K` / `Ctrl+K` is already wired in `useKeyboardShortcuts.ts` to toggle `commandPaletteOpen`
- The `useUIStore` already has `commandPaletteOpen`, `setCommandPaletteOpen`, and `toggleCommandPalette` state
