# Design System — Monolithic Lexicon

**Date:** 2026-04-14
**Status:** Active
**Aesthetic:** Organic Brutalism / Digital Archivist

---

## Overview

The **Monolithic Lexicon** design system powers the AKL's Knowledge dashboard — a read-only React SPA that visualizes opencode AI session data. The system follows an "Organic Brutalism" aesthetic: dark, terminal-inspired, with monospace typography, tonal depth over borders, and a GitHub-dark-inspired color palette.

**Key files:**
- `src/index.css` — Global styles, Tailwind CSS v4 `@theme` tokens, utility classes
- `vite.config.ts` — `@tailwindcss/vite` plugin configuration
- `src/components/` — All reusable UI components (9 subdirectories, 33 components)

---

## Design System Architecture

```mermaid
graph TB
    subgraph "Tailwind CSS v4"
        TAILWIND["@tailwindcss/vite<br/>vite.config.ts"]
        THEME["@theme block<br/>src/index.css"]
    end

    subgraph "CSS Token Layer"
        COLORS[Color Tokens<br/>--color-*]
        SHADOWS[Shadow Tokens<br/>--shadow-sb-*]
        RADIUS[Radius Tokens<br/>--radius-sb-*]
        FONTS[Font Tokens<br/>--font-*]
        SB_TOKENS[Legacy sb-* Tokens<br/>backward compat]
    end

    subgraph "Utility Classes"
        SB_BORDER[.sb-border<br/>.sb-border-strong]
        SB_SHADOWS[.sb-shadow-*<br/>xs → xl + inner]
        SB_CARDS[.sb-card<br/>.sb-card-{para}]
        SB_BTNS[.sb-btn<br/>.sb-btn-{variant}]
        SB_INPUTS[.sb-input]
        SB_TAGS[.sb-tag<br/>.sb-tag-{para}]
        GLASS[.glass-panel]
    end

    subgraph "Icon System"
        MATERIAL[MaterialIcon.tsx<br/>Material Symbols Outlined]
        LUCIDE[Icon.tsx<br/>lucide-react SVG]
        AGENT_ICONS[AgentIcons.tsx<br/>emoji→icon mapping]
    end

    subgraph "Layout Components"
        TOPBAR[TopBar.tsx]
        SIDEBAR[Sidebar.tsx]
        BREADCRUMBS[Breadcrumbs.tsx]
        RIGHTPANEL[RightPanel.tsx]
        STATUSBAR[StatusBar.tsx]
    end

    subgraph "Right Panel Tabs"
        NOTEINFO[NoteInfoPanel.tsx]
        BACKLINKS[BacklinksPanel.tsx]
        GRAPH[UnifiedGraph.tsx]
        OUTLINE[OutlinePanel.tsx]
    end

    subgraph "Search Components"
        SEARCHBAR[SearchBar.tsx]
        CMDPALETTE[CommandPalette.tsx]
    end

    subgraph "Shared Components"
        EMPTY[EmptyState.tsx]
        LOADING[LoadingSkeleton.tsx]
        STATUSBADGE[StatusBadge.tsx]
        SHORTCUT[ShortcutHelp.tsx]
        MARKDOWN[MarkdownRenderer.tsx]
        ARTICLEOUTLINE[ArticleOutline.tsx]
    end

    subgraph "Feature Components"
        SESSIONCARD[SessionCard.tsx]
        SESSIONFILTERS[SessionFilters.tsx]
        KNOWBADGE[KnowledgeBadge.tsx]
        KNOWCARD[KnowledgeSnippetCard.tsx]
        KNOWLIST[KnowledgeSnippetsList.tsx]
        HUBCARD[HubSummaryCard.tsx]
        ACTIVITY[RecentActivityFeed.tsx]
        VAULTMGR[VaultManager.tsx]
        SYNCPREVIEW[SyncPreviewModal.tsx]
    end

    subgraph "Editor Components"
        NOTEEDITOR[NoteEditor.tsx]
        WIKILINK[WikilinkSuggestion.tsx]
    end

    subgraph "Graph Components"
        UNIFIEDGRAPH[UnifiedGraph.tsx]
        GRAPHCTRLS[GraphControls.tsx]
        GRAPHLEGEND[GraphLegend.tsx]
    end

    TAILWIND --> THEME
    THEME --> COLORS
    THEME --> SHADOWS
    THEME --> RADIUS
    THEME --> FONTS
    THEME --> SB_TOKENS

    COLORS --> SB_BTNS
    COLORS --> SB_CARDS
    COLORS --> SB_TAGS
    SHADOWS --> SB_SHADOWS
    RADIUS --> SB_CARDS

    MATERIAL --> TOPBAR
    MATERIAL --> SIDEBAR
    MATERIAL --> SEARCHBAR
    MATERIAL --> CMDPALETTE
    MATERIAL --> SHORTCUT
    MATERIAL --> NOTEINFO
    MATERIAL --> BACKLINKS
    MATERIAL --> SESSIONFILTERS
    MATERIAL --> ACTIVITY
    MATERIAL --> ARTICLEOUTLINE

    LUCIDE --> AGENT_ICONS

    TOPBAR --> SEARCHBAR
    RIGHTPANEL --> NOTEINFO
    RIGHTPANEL --> BACKLINKS
    RIGHTPANEL --> GRAPH
    RIGHTPANEL --> OUTLINE

    NOTEEDITOR --> WIKILINK
    KNOWLIST --> KNOWCARD
```

---

## Component Inventory

### Layout Components (6)

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| **TopBar** | `src/components/layout/TopBar.tsx` | Fixed header with sidebar toggle, logo, global search, refresh/settings buttons | `onSidebarToggle`, `sidebarCollapsed` |
| **Sidebar** | `src/components/layout/Sidebar.tsx` | Collapsible navigation sidebar with nav items, OpenCode collapsible group, data root indicator, file watcher status | `collapsed` |
| **Breadcrumbs** | `src/components/layout/Breadcrumbs.tsx` | Route-based breadcrumb navigation bar below TopBar | None (uses `useLocation`) |
| **RightPanel** | `src/components/layout/RightPanel.tsx` | Tabbed right panel with Info, Links, Graph, Outline tabs | None (uses Zustand store) |
| **StatusBar** | `src/components/layout/StatusBar.tsx` | Fixed footer with version, session count, file watcher status | None |
| **NoteInfoPanel** | `src/components/layout/NoteInfoPanel.tsx` | Note metadata display: title, category, stats grid, tags, dates, delete action | None (uses active note from store) |
| **BacklinksPanel** | `src/components/layout/BacklinksPanel.tsx` | Lists notes that link to the active note | None |
| **OutlinePanel** | `src/components/layout/OutlinePanel.tsx` | Displays heading outline of active note with click-to-scroll | None |

### Search Components (2)

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| **SearchBar** | `src/components/search/SearchBar.tsx` | Global search input with debounced API search, dropdown results, keyboard navigation (⌘K) | None |
| **CommandPalette** | `src/components/search/CommandPalette.tsx` | Modal command palette with commands + note search, keyboard navigation, PARA category display | None (uses Zustand store) |

### Shared Components (7)

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| **MaterialIcon** | `src/components/shared/MaterialIcon.tsx` | Wrapper for Material Symbols Outlined font icons | `name`, `size` (default 20), `filled`, `weight`, `className` |
| **Icon** | `src/components/shared/Icon.tsx` | Wrapper for lucide-react SVG icons with typed registry | `name` (IconName), `size` (default 24), `strokeWidth`, `color`, `ariaLabel`, `ariaHidden`, `className` |
| **AgentIcons** | `src/components/shared/AgentIcons.tsx` | Emoji-to-Lucide icon mapping with `getIconForEmoji()` and `SmartIcon` component | `emoji`, `defaultIcon`, `size`, `className` |
| **EmptyState** | `src/components/shared/EmptyState.tsx` | Centered empty state with icon, title, description, optional action button | `title`, `description`, `action?` |
| **LoadingSkeleton** | `src/components/shared/LoadingSkeleton.tsx` | Pulsing skeleton loader with configurable line count | `lines` (default 5) |
| **StatusBadge** | `src/components/shared/StatusBadge.tsx` | Colored pill badge for session/agent status | `status` |
| **ShortcutHelp** | `src/components/shared/ShortcutHelp.tsx` | Modal overlay showing all keyboard shortcuts | None |
| **MarkdownRenderer** | `src/components/shared/MarkdownRenderer.tsx` | Renders markdown to HTML via `marked` + DOMPurify, with optional heading ID injection | `content`, `className?`, `headingIds?` |
| **ArticleOutline** | `src/components/shared/ArticleOutline.tsx` | Collapsible article/table-of-contents outline with keyboard navigation | `headings`, `activeHeadingId`, `onHeadingClick` |

### Session Components (2)

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| **SessionCard** | `src/components/sessions/SessionCard.tsx` | Session list item with colored accent bar, title, agent, time, tokens, cost, status badge | `session: SessionSummary` |
| **SessionFilters** | `src/components/sessions/SessionFilters.tsx` | Filter chips for agent and status with clear button | `meta`, `filters`, `onFilterChange` |

### Knowledge Components (3)

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| **KnowledgeBadge** | `src/components/knowledge/KnowledgeBadge.tsx` | Small pill showing finding count | `count` |
| **KnowledgeSnippetCard** | `src/components/knowledge/KnowledgeSnippetCard.tsx` | Card for a single knowledge snippet (finding/file/action) with type badge | `snippet: KnowledgeSnippet` |
| **KnowledgeSnippetsList** | `src/components/knowledge/KnowledgeSnippetsList.tsx` | Grouped list of snippets by type (findings, files, actions) with loading skeleton | `snippets`, `loading?` |

### OpenCode Components (2)

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| **HubSummaryCard** | `src/components/opencode/HubSummaryCard.tsx` | Summary card for agents/skills/configs with count, top 3 items, "View All" link | `title`, `count`, `entityType`, `topItems`, `viewAllPath` |
| **RecentActivityFeed** | `src/components/opencode/RecentActivityFeed.tsx` | Timeline of recent session activity with timestamps | `sessions` |

### Graph Components (3)

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| **UnifiedGraph** | `src/components/graph/UnifiedGraph.tsx` | D3.js force-directed graph visualization (mini/full modes) with drag, hover tooltips, node click navigation | `nodes`, `edges`, `width`, `height`, `mode`, `onNodeClick?` |
| **GraphControls** | `src/components/graph/GraphControls.tsx` | PARA category filter toggles + zoom controls | `activeFilters`, `onFilterChange`, `zoom`, `onZoomIn`, `onZoomOut`, `onReset` |
| **GraphLegend** | `src/components/graph/GraphLegend.tsx` | Legend showing entity types (session/topic/agent/skill) with colored dots | `activeTypes?`, `onToggle?` |

### Editor Components (2)

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| **NoteEditor** | `src/components/editor/NoteEditor.tsx` | TipTap rich text editor with title input, PARA category tag, custom tags, wikilink suggestions | `onContentUpdate`, `onTitleUpdate`, `onWikilinkClick` |
| **WikilinkSuggestion** | `src/components/editor/WikilinkSuggestion.tsx` | Autocomplete dropdown for wikilink insertion (`[[`) | `query`, `onSelect`, `onClose` |

### Vault Components (2)

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| **VaultManager** | `src/components/vaults/VaultManager.tsx` | CRUD interface for managed vaults (add/remove paths) | `vaults`, `onVaultsChange` |
| **SyncPreviewModal** | `src/components/vaults/SyncPreviewModal.tsx` | Modal showing vault sync diff preview with per-vault expandable file lists | `isOpen`, `onClose`, `onSyncComplete` |

---

## Styling Patterns

### Tailwind CSS v4 Configuration

Tailwind CSS v4 is configured via the `@tailwindcss/vite` plugin in `vite.config.ts` — **no `tailwind.config.js` file exists**. All theme tokens are defined in the `@theme` block within `src/index.css`.

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Color Token System

The design system uses a **dual-layer** color token approach:

#### Layer 1: Material Design 3 Tokens (Primary)

Defined as `--color-*` CSS custom properties in the `@theme` block. These are the canonical tokens used by Tailwind utility classes:

| Token Category | Example Tokens | Usage |
|---------------|----------------|-------|
| **Surface** | `--color-surface`, `--color-surface-container-low`, `--color-surface-container-high`, `--color-surface-topbar`, `--color-surface-sidebar` | Backgrounds, cards, panels |
| **On-Surface** | `--color-on-surface`, `--color-on-surface-variant` | Text colors |
| **Primary** | `--color-primary` (#a2c9ff), `--color-primary-container` (#58a6ff) | Links, accents, active states |
| **Secondary** | `--color-secondary` (#fabc45), `--color-secondary-container` | Warnings, highlights |
| **Tertiary** | `--color-tertiary` (#67df70) | Success, connected status |
| **Error** | `--color-error` (#ffb4ab), `--color-error-container` | Error states |
| **Outline** | `--color-outline-variant` (#414752), `--color-outline` (#8b919d) | Borders, muted text |

**Tailwind usage:** `bg-surface-container`, `text-on-surface`, `border-outline-variant/15`, `text-primary`

#### Layer 2: Legacy `sb-*` Tokens (Backward Compatibility)

Defined as `--color-sb-*` CSS custom properties. These provide shorthand aliases and additional colors not in the Material palette:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-sb-bg` | `#10141a` | Page background |
| `--color-sb-surface` | `#1c2026` | Card backgrounds |
| `--color-sb-surface-alt` | `#262a31` | Alternate surfaces |
| `--color-sb-text` | `#dfe2eb` | Primary text |
| `--color-sb-text-secondary` | `#8b919d` | Secondary text |
| `--color-sb-text-muted` | `#6e7681` | Muted text |
| `--color-sb-border` | `#30363d` | Default borders |
| `--color-sb-accent` | `#58a6ff` | Accent color |
| `--color-sb-success` | `#67df70` | Success states |
| `--color-sb-warning` | `#fabc45` | Warning states |
| `--color-sb-error` | `#ffb4ab` | Error states |
| `--color-sb-yellow` | `#d29922` | Yellow accent |
| `--color-sb-pink` | `#f778ba` | Pink accent |
| `--color-sb-blue` | `#58a6ff` | Blue accent |
| `--color-sb-green` | `#3fb950` | Green accent |
| `--color-sb-orange` | `#d29922` | Orange accent |
| `--color-sb-purple` | `#bc8cff` | Purple accent |
| `--color-sb-red` | `#f85149` | Red accent |

**PARA category colors:**
| Token | Value | Category |
|-------|-------|----------|
| `--color-sb-projects` | `#d29922` | Projects (yellow) |
| `--color-sb-areas` | `#58a6ff` | Areas (blue) |
| `--color-sb-resources` | `#3fb950` | Resources (green) |
| `--color-sb-archive` | `#484f58` | Archive (gray) |

**Tint variants** (10% opacity overlays): `--color-sb-yellow-tint`, `--color-sb-blue-tint`, `--color-sb-green-tint`, `--color-sb-pink-tint`, `--color-sb-purple-tint`, `--color-sb-orange-tint`

### Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sb-xs` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle elevation |
| `--shadow-sb-sm` | `0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)` | Small elevation |
| `--shadow-sb` | `0 1px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)` | Default elevation |
| `--shadow-sb-md` | `0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)` | Medium elevation |
| `--shadow-sb-lg` | `0 8px 24px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.2)` | Large elevation |
| `--shadow-sb-xl` | `0 16px 48px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.2)` | Search dropdowns, modals |
| `--shadow-sb-inner` | `inset 0 1px 3px rgba(0,0,0,0.3)` | Inset shadows |
| `--shadow-sb-focus` | `0 0 0 3px rgba(162, 201, 255, 0.25)` | Focus rings |

**Tailwind usage:** `shadow-sb-xl` (via `@theme` shadow definitions)

### Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sb-sm` | `6px` | Buttons, small elements |
| `--radius-sb` | `10px` | Cards, panels |
| `--radius-sb-lg` | `14px` | Large panels, modals |
| `--radius-sb-xl` | `20px` | Extra large containers |
| `--radius-sb-full` | `9999px` | Pills, badges, circular elements |

### Typography Tokens

| Token | Font Family | Usage |
|-------|-------------|-------|
| `--font-headline` | `'Space Grotesk', system-ui, ...` | Headings, titles, labels |
| `--font-display` | `'Space Grotesk', system-ui, ...` | Display text, note titles |
| `--font-body` | `system-ui, -apple-system, ...` | Body text (default) |
| `--font-mono` | `'Space Mono', 'SF Mono', ...` | Code, terminal-style text, metadata |
| `--font-serif` | `'Literata', Georgia, ...` | Prose, markdown body, descriptions |
| `--font-editor` | `'Literata', Georgia, serif` | TipTap editor content |
| `--font-label` | `'Space Grotesk', system-ui, ...` | Labels, tags |

### Custom Utility Classes

#### Border Utilities
```css
.sb-border          /* border: 1px solid var(--color-sb-border) */
.sb-border-strong   /* border: 1px solid var(--color-sb-border-strong) */
```

#### Shadow Utilities
```css
.sb-shadow-xs   .sb-shadow-sm   .sb-shadow   .sb-shadow-md
.sb-shadow-lg   .sb-shadow-xl   .sb-shadow-inner
```

#### Card System — "No-Line Rule"

Cards use **tonal depth, not borders** for elevation:
```css
.sb-card {
  background: var(--color-surface-container-low);
  border: 1px solid transparent;  /* transparent border reserves space */
  border-radius: var(--radius-sb);
  transition: background 0.15s ease;
}
.sb-card:hover { background: var(--color-surface-container-high); }
```

**PARA-specific cards** (colored left accent bar):
```css
.sb-card-projects   /* yellow #d29922 */
.sb-card-areas      /* blue #58a6ff */
.sb-card-resources  /* green #3fb950 */
.sb-card-archive    /* gray #484f58 */
```

#### Button System
```css
.sb-btn              /* Default: surface-container bg, subtle border */
.sb-btn-primary      /* Gradient: primary → primary-container */
.sb-btn-accent       /* Solid: sb-accent blue */
.sb-btn-success      /* Solid: sb-success green */
.sb-btn-error        /* Solid: sb-error red */
.sb-btn-yellow       /* Solid: sb-yellow */
.sb-btn-pink         /* Solid: sb-pink */
.sb-btn-blue         /* Solid: sb-blue */
.sb-btn-green        /* Solid: sb-green */
.sb-btn-orange       /* Solid: sb-orange */
.sb-btn-purple       /* Solid: sb-purple */
```

All buttons share: `border-radius: var(--radius-sb-sm)`, `font-family: var(--font-headline)`, `font-weight: 500`, `transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1)`, `:active { transform: scale(0.95) }`.

#### Input System — "Command-line style"
```css
.sb-input {
  border: none;
  border-bottom: 1px solid var(--color-outline-variant);
  border-radius: 0;
  font-family: var(--font-mono);
  padding: 8px 0;
}
.sb-input:focus { border-bottom-color: var(--color-primary); }
```

#### Tag/Badge System — Pill style
```css
.sb-tag {
  border-radius: var(--radius-sb-full);
  padding: 2px 10px;
  font-size: 10px;
  font-weight: 500;
  font-family: var(--font-headline);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.sb-tag-projects   /* yellow bg */
.sb-tag-areas      /* blue bg */
.sb-tag-resources  /* green bg */
.sb-tag-archive    /* gray bg */
```

#### Glass Panel
```css
.glass-panel {
  background: rgba(28, 32, 38, 0.8);
  backdrop-filter: blur(12px);
}
```

### Scrollbar Styling

Slim 4px scrollbar across the entire app:
```css
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-sb-border); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-sb-border-strong); }
```

### Selection Styling
```css
::selection {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
}
```

---

## Layout Patterns

### Three-Panel Layout

The app uses a fixed three-panel layout with top bar and status bar:

```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR (h-12, fixed, z-50)                             │
│  [☰] Monolithic Lexicon    [SearchBar...]    [↻] [⚙]   │
├──────────┬──────────────────────────────────┬───────────┤
│ SIDEBAR  │  CONTENT AREA                    │ RIGHTPANEL│
│ (w-56 or │  (flex-1, scrollable)            │ (w-60)    │
│  w-12)   │                                  │           │
│          │  [Breadcrumbs]                   │ [Tabs]    │
│ [Nav]    │  [Page Content]                  │ [Content] │
│          │                                  │           │
│ [Footer] │                                  │           │
├──────────┴──────────────────────────────────┴───────────┤
│  STATUSBAR (h-6, fixed, z-50)                           │
│  v1.2.0-stable  ● 3 Active Sessions    File Watcher: OK │
└─────────────────────────────────────────────────────────┘
```

**Key layout classes:**
- **TopBar:** `h-12 fixed top-0 left-0 right-0 z-50 bg-surface-topbar border-b border-outline-variant/15`
- **Sidebar:** `h-full bg-surface-sidebar border-r border-outline-variant/15 transition-all duration-200` with `w-56` (expanded) or `w-12` (collapsed)
- **StatusBar:** `h-6 fixed bottom-0 left-0 right-0 z-50 bg-surface-sidebar border-t border-outline-variant/15`
- **Breadcrumbs:** `h-8 bg-surface-container-low border-b border-outline-variant/15`
- **RightPanel tabs:** `flex border-b border-outline-variant/15` with equal-width buttons

### Card Pattern

Cards follow the "No-Line Rule" — tonal depth instead of visible borders:
```tsx
<div className="bg-surface-container-low rounded-lg p-4">
  {/* content */}
</div>
```

For hoverable cards:
```tsx
<div className="bg-surface-container-low hover:bg-surface-container-high transition-all duration-150 rounded-lg">
  {/* content */}
</div>
```

### List Item Pattern

Active/selected items use a left border accent:
```tsx
// Active nav item
className="text-on-surface bg-surface-topbar border-l-2 border-primary-container"

// Active search result
className="bg-primary/10 border-l-2 border-primary"

// Active outline heading
className="text-primary border-l-2 border-primary-container"
```

### Modal/Overlay Pattern

Modals use a dark backdrop with blur:
```tsx
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-surface-container-highest border border-outline-variant/15 rounded-xl p-6 shadow-sb-xl">
    {/* content */}
  </div>
</div>
```

Command palette uses a slightly different variant:
```tsx
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 z-50">
  <div className="w-full max-w-2xl bg-surface-container/90 backdrop-blur-xl border border-outline-variant/20 rounded-xl shadow-2xl">
    {/* content */}
  </div>
</div>
```

### Status Indicator Pattern

Status uses colored dots (not icons):
```tsx
<span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
```

Status badges use tinted backgrounds with colored text:
```tsx
<span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-sb-warning/15 text-sb-warning">
  active
</span>
```

### Keyboard Shortcut Display

Shortcuts displayed as `<kbd>` elements:
```tsx
<kbd className="font-mono text-[10px] text-outline-variant bg-surface-container-high border border-outline-variant/30 rounded px-1.5 py-0.5">
  ⌘K
</kbd>
```

---

## Icon System

The app uses a **dual icon system**:

### Material Symbols Outlined (Primary)

Used throughout the layout and feature components via `MaterialIcon.tsx`:
- Renders via Google Material Symbols font (web font loaded in HTML)
- Uses CSS `font-variation-settings` for fill/weight control
- All icons are `aria-hidden="true"` by default
- Default size: 20px

**Icons used:** `history`, `topic`, `leaderboard`, `move_up`, `smart_toy`, `terminal`, `settings_input_component`, `expand_more`, `chevron_right`, `folder`, `database`, `vertical_split`, `refresh`, `settings`, `info`, `link`, `hub`, `segment`, `search`, `bolt`, `description`, `keyboard_arrow_up`, `keyboard_arrow_down`, `keyboard_return`, `keyboard`, `close`, `inbox`, `cloud_done`, `delete`, `expand_less`

### Lucide React (Secondary)

Used via `Icon.tsx` for a typed SVG icon registry:
- 27 registered icons with `IconName` type safety
- Renders inline SVGs with `currentColor`
- Supports `ariaLabel` and `ariaHidden` props
- Default size: 24px, strokeWidth: 2

**Registered icons:** `ClipboardList`, `Users`, `Wrench`, `BookOpen`, `Settings`, `BarChart3`, `ArrowLeftRight`, `PanelLeft`, `PanelLeftClose`, `Brain`, `RefreshCw`, `FolderOpen`, `Info`, `Link`, `Hexagon`, `List`, `MessageSquare`, `Bot`, `Search`, `FileText`, `Keyboard`, `X`, `Trash2`, `Zap`, `ChevronDown`, `ChevronRight`

### Emoji-to-Icon Mapping

`AgentIcons.tsx` provides `getIconForEmoji()` and `SmartIcon` for mapping emoji characters to Lucide icons, used for data-driven emoji from frontmatter (agent.emoji, skill.emoji).

---

## Theme Configuration

### Dark Theme Only

The design system is **dark theme only** — no light theme support exists. All colors are optimized for dark backgrounds.

### Base Colors

| Role | Color | Hex |
|------|-------|-----|
| Background | `--color-background` | `#10141a` |
| Surface (lowest) | `--color-surface-container-lowest` | `#0a0e14` |
| Surface (low) | `--color-surface-container-low` | `#181c22` |
| Surface (default) | `--color-surface-container` | `#1c2026` |
| Surface (high) | `--color-surface-container-high` | `#262a31` |
| Surface (highest) | `--color-surface-container-highest` | `#31353c` |
| TopBar | `--color-surface-topbar` | `#161b22` |
| Sidebar | `--color-surface-sidebar` | `#0d1117` |

### Contrast Ratios

All text colors meet WCAG AA minimum 4.5:1 contrast on their backgrounds:
- `on-surface` (#dfe2eb) on `surface-sidebar` (#0d1117) = **~14:1**
- `on-surface-variant` (#c0c7d4) on `surface-sidebar` (#0d1117) = **~10:1**
- `outline-variant` (#414752) on `surface-sidebar` (#0d1117) = **~4.6:1**

---

## Key Decisions and Patterns

1. **Tailwind CSS v4 via `@tailwindcss/vite`** — No `tailwind.config.js`. All tokens defined in `@theme` block in CSS.
2. **Dual icon system** — Material Symbols for UI icons, Lucide React for typed SVG icons. Both coexist.
3. **No-Line Rule for cards** — Cards use tonal depth (background color changes) instead of visible borders for elevation.
4. **Monospace metadata** — All metadata (timestamps, counts, status, filters) uses `font-mono` for a terminal aesthetic.
5. **PARA color coding** — Projects (yellow), Areas (blue), Resources (green), Archive (gray) consistently applied across cards, tags, and graph filters.
6. **Fixed layout with z-index layering** — TopBar (z-50), StatusBar (z-50), modals/dropdowns (z-50).
7. **Transition consistency** — All interactive elements use `transition-colors` or `transition-all` with `0.15s` duration.
8. **Uppercase tracking-wide labels** — Sidebar nav, breadcrumbs, section headers use `uppercase tracking-widest` or `tracking-wider` for a terminal/monolithic aesthetic.
9. **Left-border active indicators** — Active nav items, search results, and outline headings use `border-l-2` with accent colors.
10. **Slim 4px scrollbars** — Custom scrollbar styling across the entire app.

---

## Gotchas

1. **No `tailwind.config.js`** — Tailwind v4 uses `@theme` in CSS. Do not create a config file; add tokens to `src/index.css`.
2. **Dual icon systems coexist** — `MaterialIcon` (font-based) is used in most components. `Icon` (SVG-based) exists but is not yet widely adopted. New components should pick one and be consistent.
3. **`sb-*` tokens are backward compat** — The Material Design 3 tokens (`--color-surface-*`, `--color-on-surface-*`) are the canonical layer. `sb-*` tokens exist for legacy compatibility.
4. **Transparent border on `.sb-card`** — Cards have `border: 1px solid transparent` to reserve space and prevent layout shift when borders are added on hover.
5. **`aria-hidden="true"` on all MaterialIcon** — The MaterialIcon component hardcodes `aria-hidden="true"`. Parent elements must provide accessible labels.
6. **Content padding in NoteEditor** — Editor uses `px-8 pt-6` for generous margins; this is intentional for the reading experience.
7. **D3 graph uses hardcoded colors** — `UnifiedGraph.tsx` uses hardcoded `#4a5568` for edge strokes and `#1a202c` for node strokes, not CSS tokens.
8. **Some components still use emoji** — `SessionCard.tsx` still uses `🤖` emoji inline. `SyncPreviewModal.tsx` uses `✚`, `✎`, `✓`, `✕` characters.
9. **`bg-sb-bg-secondary` referenced but not defined** — `VaultManager.tsx` and `SyncPreviewModal.tsx` reference `bg-sb-bg-secondary` and `bg-sb-bg-tertiary` which are not in the `@theme` block — these may be undefined.
10. **Font loading** — `Space Grotesk`, `Space Mono`, and `Literata` must be loaded via `<link>` in the HTML head (not managed by Tailwind).

---

## Related Documentation

- [New Design System — Emoji to SVG Icon Migration](./new-design-system.md) — Detailed icon migration plan
- [Requirements: New Design System](../requirements/new-design-system.md) — Original requirements document
- [AGENTS.md](../../AGENTS.md) — Project overview and architecture
- [Server API Routes](../../server/) — Backend API documentation
