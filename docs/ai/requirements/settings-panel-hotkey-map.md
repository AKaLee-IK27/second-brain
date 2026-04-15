# Requirement: Settings Panel with Hotkey Map Tab

**Date:** 2026-04-14
**Status:** Approved
**Author:** Scribe

## User Story

As a user of AKL's Knowledge, I want a settings panel accessible from the TopBar settings button with a dedicated tab showing all keyboard shortcuts so that I can discover and reference available hotkeys without memorizing them or opening the command palette.

## Context

### Current State
- The TopBar settings button (`src/components/layout/TopBar.tsx:47-52`) renders a gear icon but has **no `onClick` handler** — it is non-functional
- A `ShortcutHelp` modal (`src/components/shared/ShortcutHelp.tsx`) exists as a transient overlay triggered by `Ctrl+?` or the Command Palette "Show Keyboard Shortcuts" command
- Keyboard shortcuts are defined in **three separate locations** with no single source of truth:
  - `src/hooks/useKeyboardShortcuts.ts` — actual key event handlers
  - `src/components/shared/ShortcutHelp.tsx` — display array (`SHORTCUTS`)
  - `src/components/search/CommandPalette.tsx` — commands array with shortcut labels
- The UI store (`src/state/ui-store.ts`) manages `shortcutHelpOpen` boolean state for the modal
- The app uses Zustand for state management, Material Icons for iconography, and Tailwind CSS v4 for styling

### Existing Shortcuts (from `useKeyboardShortcuts.ts`)
| Action | Shortcut | Modifier |
|--------|----------|----------|
| Command Palette | `K` | Ctrl/Cmd |
| New Note | `N` | Ctrl/Cmd |
| Toggle Sidebar | `\` | Ctrl/Cmd |
| Toggle Right Panel | `/` | Ctrl/Cmd |
| Focus Mode | `.` | Ctrl/Cmd |
| Show Shortcuts | `?` | Ctrl/Cmd+Shift |
| Graph View | `G` | None (when not typing) |
| Close overlays | `Esc` | None |

### Existing TipTap Editor Shortcuts (from `ShortcutHelp.tsx`)
| Action | Shortcut |
|--------|----------|
| Bold | `Ctrl+B` |
| Italic | `Ctrl+I` |
| Heading | `Ctrl+Shift+H` |
| Wikilink | `[[` |

## Acceptance Criteria

### Settings Panel Infrastructure
- [ ] Given the TopBar settings button, when the user clicks it, then a settings panel opens as a slide-over panel from the right side of the viewport (not a modal overlay)
- [ ] Given the settings panel is open, when the user clicks outside the panel or presses `Esc`, then the panel closes
- [ ] Given the settings panel is open, when the user clicks the settings button again, then the panel closes (toggle behavior)
- [ ] Given the settings panel, when it renders, then it displays a tab bar with at least two tabs: "Keyboard Shortcuts" and "About"
- [ ] Given the settings panel, when it first opens, then the "Keyboard Shortcuts" tab is selected by default

### Hotkey Map Tab
- [ ] Given the "Keyboard Shortcuts" tab is active, when the tab renders, then it displays all keyboard shortcuts grouped by category: "Global", "Navigation", "Editor"
- [ ] Given a shortcut entry in the hotkey map, when it renders, then it displays the action name and the key combination using `<kbd>` elements styled with `font-mono text-xs bg-surface-container border border-outline-variant/30 rounded-sm px-2 py-1 text-on-surface-variant` (the existing `<kbd>` design token pattern used across the application)
- [ ] Given the hotkey map, when the modifier key is displayed, then it shows "⌘" on macOS and "Ctrl" on other platforms (platform-aware rendering)
- [ ] Given the hotkey map data source, when shortcuts are rendered, then they are sourced from a **single shared data structure** (not duplicated across components)
- [ ] Given the hotkey map, when a shortcut has a complex key combination (e.g., `Ctrl+Shift+?`), then each key segment is rendered in its own `<kbd>` element with a `+` separator between them

### Single Source of Truth
- [ ] Given the shortcut definitions, when the application builds, then all shortcut data (action name, key combination, category, handler reference) originates from a single module exported for use by `useKeyboardShortcuts.ts`, `ShortcutHelp.tsx`, `CommandPalette.tsx`, and the new Settings Panel
- [ ] Given the single shortcut source module, when a test adds a new shortcut entry to it, then the Settings Panel hotkey map renders the new shortcut, the Command Palette includes the new command, and the `useKeyboardShortcuts` hook responds to the new key combination — with no modifications required in those consumer files

### Settings Panel Visual Design
- [ ] Given the settings panel, when it renders, then it uses the existing design tokens (`surface-container-highest`, `outline-variant/15`, `on-surface`, `on-surface-variant`) consistent with the rest of the application
- [ ] Given the settings panel, when it renders, then it has a fixed width of `w-96` (384px) and spans the full viewport height minus the TopBar (`top-12`)
- [ ] Given the settings panel tab bar, when it renders, then the active tab is visually distinguished with a bottom border in `text-primary` (Tailwind utility) and the inactive tabs use `text-on-surface-variant`
- [ ] Given the settings panel header, when it renders, then it displays "Settings" as the title and a close button (X icon) in the top-right corner

### About Tab
- [ ] Given the "About" tab is active, when the tab renders, then it displays the application name "Monolithic Lexicon", the current app version (injected at build time via `import.meta.env.PACKAGE_VERSION` or read from `package.json` at server startup and exposed via `GET /api/config`), and a brief description: "A read-only React dashboard that visualizes opencode AI session data"
- [ ] Given the "About" tab, when it renders, then it displays a link to the project repository **if and only if** a `repository` field exists in `package.json` or a `REPOSITORY_URL` environment variable is set at build time — otherwise the repository link section is omitted entirely. It also displays the current data root path fetched from `GET /api/config` (the existing endpoint that returns `{ dataRoot: string }`)

### Accessibility
- [ ] Given the settings panel, when it opens, then keyboard focus is trapped within the panel and the close button receives initial focus
- [ ] Given the settings panel, when it closes, then keyboard focus returns to the settings button that triggered it
- [ ] Given the settings panel, when it is open, then it has `role="dialog"` and `aria-label="Settings"` attributes
- [ ] Given the tab bar, when a user navigates with keyboard, then `Arrow Left`/`Arrow Right` moves focus between tabs, `Space`/`Enter` activates the focused tab, and `Tab` moves focus out of the tab bar into the tabpanel — following the WAI-ARIA Tabs pattern with manual activation mode

### Performance
- [ ] Given the settings panel, when it opens, then no visible jank occurs (no frame drops perceptible to the user) and the panel becomes interactive within 100ms of the click event
- [ ] Given the settings panel, when it is closed, then it is unmounted from the DOM (not just hidden via CSS) to avoid unnecessary re-renders — the mount cost is deferred via conditional rendering (`{settingsOpen && <SettingsPanel />}`)

## Constraints

### Technical
- The settings panel must be a React component using existing patterns (Zustand for state, Tailwind CSS for styling)
- The panel must not introduce new external dependencies
- The shortcut data source must be a TypeScript module (not JSON) to support typed definitions and function references
- The panel must work with the existing `TopBar` component without restructuring it
- Platform detection for modifier keys must use `navigator.platform` (consistent with existing `useKeyboardShortcuts.ts`)

### Business
- The app is read-only — the settings panel must not provide any write/edit capabilities for session data
- The settings panel is for discovery and configuration only — no data modification
- The dark theme is the only theme — no light theme toggle needed in this iteration

### Performance
- The settings panel component must be lazy-loaded or code-split if it adds more than 5KB gzipped to the initial bundle

### Edge Cases
- If the shortcut definitions array is empty, the hotkey map tab displays a message: "No keyboard shortcuts defined"
- If the `GET /api/config` request fails or times out while rendering the About tab, the data root path field displays "Unable to load" in muted text — the rest of the About tab still renders normally
- If the user rapidly clicks the settings button (open → close → open), the panel state toggles correctly without animation glitches or duplicate instances
- If the viewport width is less than 384px (`w-96`), the panel width adapts to `100vw` with no horizontal overflow

## Out of Scope

- Settings persistence (user preferences saved to localStorage or server) — the panel is read-only for this iteration
- Customizable keyboard shortcuts (remapping keys) — shortcuts are fixed
- Additional settings tabs beyond "Keyboard Shortcuts" and "About" (e.g., theme toggle, data root configuration)
- Changes to the existing `ShortcutHelp` modal behavior — it remains functional as a quick-access overlay
- Changes to the Command Palette — it continues to show shortcuts inline as before
- Mobile/touch gesture shortcuts — keyboard only for this iteration
- Search/filter functionality within the hotkey map
- Printing or exporting the hotkey map

## Related Decisions

- **New Design System** (`docs/ai/requirements/new-design-system.md`) — established the icon library (Material Icons), design tokens (`sb-*`), and styling conventions that the settings panel must follow
- No past decisions found regarding settings panels, keyboard shortcut management, or single-source-of-truth patterns for shortcuts
