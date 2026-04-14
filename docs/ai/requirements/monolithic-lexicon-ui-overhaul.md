# Requirement: Monolithic Lexicon UI Overhaul

**Date:** 2026-04-13
**Status:** Reviewed ✅
**Author:** Scribe
**Reviewed by:** Oracle

## User Story

As a user of AKL's Knowledge, I want the entire application UI redesigned to follow "The Monolithic Lexicon" design system so that the application feels like a sophisticated intellectual instrument rather than a generic web app, with consistent typography (Space Grotesk / Space Mono / Literata), tonal depth instead of borders, and PARA-colored category semantics across all screens.

## Context

### Current State
- **Framework:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4
- **Existing Design System:** `sb-` prefixed CSS custom properties in `src/index.css` (GitHub-inspired dark theme, `#0d1117` background)
- **Existing Routes (14):** App, SessionsPage, SessionDetailPage, TopicsPage, TopicDetailPage, AgentsPage, AgentDetailPage, SkillsPage, ConfigsPage, StatsPage, MigrationPage, SetupPage, OpenCodePage, NotFoundPage
- **Existing Component Directories:** `components/editor/`, `components/graph/`, `components/knowledge/`, `components/layout/`, `components/opencode/`, `components/search/`, `components/sessions/`, `components/shared/`, `components/vaults/`
- **Icon Library:** Lucide React (`lucide-react`)
- **State Management:** Zustand
- **Storage:** Dexie (IndexedDB)
- **Editor:** TipTap
- **Search:** Fuse.js
- **Graph:** D3.js
- **Virtualization:** @tanstack/react-virtual

### Target Design System: "The Monolithic Lexicon"
Source: `/Users/khoi.le/Downloads/stitch/monolith_dark/DESIGN.md` + 9 HTML mockups in `/Users/khoi.le/Downloads/stitch/`

**Creative North Star:** "The Digital Archivist" — a high-performance intellectual instrument using "Organic Brutalism" with intentional asymmetry.

**Key Design Principles:**
1. **No-Line Rule:** 1px solid borders prohibited for layout sectioning. Boundaries defined by background shifts (tonal depth).
2. **Tonal Layering:** Elevation is a color, not a shadow. Progression: `background` → `surface-container-low` → `surface-container-high` → `surface-container-highest`.
3. **Glass & Gradient:** Floating modals use glassmorphism (`backdrop-blur: 12px`, 80% opacity). Primary CTAs use gradient from `primary` to `primary-container`.
4. **Three-Family Typography:** Space Grotesk (Display/UI), Space Mono (Code/Meta), Literata (Article Body).
5. **PARA Category Semantics:** Projects (`#d29922`), Areas (`#58a6ff`), Resources (`#3fb950`), Archives (`#484f58`).
6. **Command-Line Inputs:** No background, bottom-border only, `>` prefix in accent blue.
7. **Data-Dense Spacing:** Tight margins, `line-height: 1.6` for Literata text.

### New Color Tokens (from mockups)
| Token | Value | Purpose |
|-------|-------|---------|
| `background` | `#10141a` | Primary background (replaces `sb-bg` `#0d1117`) |
| `surface` | `#10141a` | Same as background |
| `surface-container-lowest` | `#0a0e14` | Deepest surface layer |
| `surface-container-low` | `#181c22` | Sidebar, list items |
| `surface-container` | `#1c2026` | Cards, panels |
| `surface-container-high` | `#262a31` | Hover states, elevated cards |
| `surface-container-highest` | `#31353c` | Modals, dialogs |
| `surface-bright` | `#353940` | Bright surface elements |
| `surface-variant` | `#31353c` | Variant surface |
| `outline-variant` | `#414752` | Ghost borders (15% opacity) |
| `outline` | `#8b919d` | Standard outlines |
| `on-surface` | `#dfe2eb` | Primary text |
| `on-surface-variant` | `#c0c7d4` | Secondary text |
| `primary` | `#a2c9ff` | Primary accent (light blue) |
| `primary-container` | `#58a6ff` | Primary container (GitHub blue) |
| `primary-fixed` | `#d3e4ff` | Fixed primary |
| `primary-fixed-dim` | `#a2c9ff` | Dim fixed primary |
| `on-primary` | `#00315c` | Text on primary |
| `on-primary-container` | `#003a6b` | Text on primary container |
| `secondary` | `#fabc45` | Secondary accent (yellow) |
| `secondary-container` | `#bd8708` | Secondary container |
| `secondary-fixed` | `#ffdeaa` | Fixed secondary |
| `secondary-fixed-dim` | `#fabc45` | Dim fixed secondary |
| `tertiary` | `#67df70` | Tertiary accent (green) |
| `tertiary-container` | `#40ba51` | Tertiary container |
| `tertiary-fixed` | `#83fc89` | Fixed tertiary |
| `tertiary-fixed-dim` | `#67df70` | Dim fixed tertiary |
| `error` | `#ffb4ab` | Error accent |
| `error-container` | `#93000a` | Error container |
| `inverse-surface` | `#dfe2eb` | Inverse surface |
| `inverse-primary` | `#0060aa` | Inverse primary |
| `surface-topbar` | `#161b22` | TopNavBar background (slightly lighter than main bg) |
| `surface-sidebar` | `#0d1117` | SideNavBar and Footer background (deepest surface) |

### Screens to Redesign (from Stitch mockups)
| # | Screen | Source File | Current Route |
|---|--------|-------------|---------------|
| 1 | Sessions Dashboard | `stitch/sessions_dashboard/` | `SessionsPage.tsx` |
| 2 | Session Detail | `stitch/session_detail/` | `SessionDetailPage.tsx` |
| 3 | Agents Directory | `stitch/agents_directory/` | `AgentsPage.tsx` |
| 4 | Analytics Dashboard (Stats) | `stitch/analytics_dashboard/` | `StatsPage.tsx` |
| 5 | Topics (PARA) | `stitch/topics_para/` | `TopicsPage.tsx` |
| 6 | Migration Tool | `stitch/migration_tool/` | `MigrationPage.tsx` |
| 7 | Setup Onboarding | `stitch/setup_onboarding/` | `SetupPage.tsx` |
| 8 | Knowledge Graph | `stitch/knowledge_graph/` | (embedded in RightPanel) |
| 9 | Command Palette | `stitch/command_palette/` | (embedded component) |

### Screens NOT in Mockups (must be designed or preserved)
| Screen | Current Route | Strategy |
|--------|---------------|----------|
| Topic Detail | `TopicDetailPage.tsx` | Extend Topics PARA design |
| Agent Detail | `AgentDetailPage.tsx` | Extend Agents Directory design |
| Skills Page | `SkillsPage.tsx` | Follow Agents Directory pattern |
| Configs Page | `ConfigsPage.tsx` | Follow Settings pattern from mockups |
| OpenCode Page | `OpenCodePage.tsx` | Preserve existing, apply new tokens |
| Not Found Page | `NotFoundPage.tsx` | Apply new design tokens |

## Acceptance Criteria

### A. Design Token Migration
- [ ] Given the `src/index.css` file, when the migration is complete, then all new Monolithic Lexicon color tokens are defined in the Tailwind `@theme` block using the exact hex values from the color token table above
- [ ] Given the existing `sb-` prefixed CSS custom properties, when the migration is complete, then all `sb-` tokens remain defined and functional (backward compatibility) with values mapped to the new Monolithic Lexicon palette
- [ ] Given the font families in the Tailwind config, when the migration is complete, then `Space Grotesk`, `Space Mono`, and `Literata` are loaded via `@import` in `src/index.css` and registered as Tailwind font families (`font-headline`, `font-mono`, `font-serif`)
- [ ] Given the border radius tokens, when the migration is complete, then the Tailwind `@theme` includes `radius` values matching the Monolithic Lexicon spec (`DEFAULT: 0.25rem`, `lg: 0.625rem` (10px), `xl: 0.75rem`, `full: 9999px`)

### B. No-Line Rule Enforcement
- [ ] Given any layout sectioning between major panels (sidebar, main content, right rail), when inspecting the computed CSS, then no `border` property with `solid` style is used for the primary separation — separation is achieved through background color transitions between `surface-container-low`, `surface-container`, and `background`
- [ ] Given card components and list items, when inspecting the computed CSS, then cards use `border: transparent` or no border, with depth conveyed through background color (`surface-container-low` on `background` surface)
- [ ] Given "ghost borders" used for accessibility, when inspecting the computed CSS, then any visible border uses `outline-variant` color at 15% opacity maximum (`rgba(65, 71, 82, 0.15)`)

### C. Typography System
- [ ] Given any heading element (h1-h3) in the application, when rendered, then the font family is `Space Grotesk` (via `font-headline`)
- [ ] Given any metadata element (timestamps, IDs, tags, file sizes, version numbers), when rendered, then the font family is `Space Mono` (via `font-mono`)
- [ ] Given any long-form reading content (note body, article text), when rendered, then the font family is `Literata` (via `font-serif`)
- [ ] Given any UI label or button text, when rendered, then the font family is `Space Grotesk` (via `font-headline`)
- [ ] Given the primary text color, when rendered on `background` (`#10141a`), then the color is `#e6edf3` (not pure white `#ffffff`)

### D. Sessions Dashboard (Screen 1)
- [ ] Given the Sessions Dashboard page, when it renders, then the layout follows a 3-panel structure: left sidebar (56px or 224px), center session list (flex-grow), right stats panel (320px / w-80)
- [ ] Given the session list, when it renders session cards, then each card displays: a colored left accent bar (status color), session title, agent name, relative timestamp, token count, cost, status badge, and chevron
- [ ] Given the command filter bar, when it renders, then it displays filter chips (e.g., `agent:all`, `status:active`) with `>` prefix and a "New Session" button with gradient background
- [ ] Given the pagination footer, when it renders, then it displays "Showing X-Y of Z sessions" text and page number buttons with the active page highlighted (50 items per page, max 5 visible page buttons with ellipsis for overflow, prev/next chevron buttons disabled at boundaries)
- [ ] Given the right stats panel, when it renders, then it displays: Knowledge Overview (Total Cost, Context), Agent Usage with progress bars, and a Weekly Summary card with image

### E. Session Detail (Screen 2)
- [ ] Given the Session Detail page, when it renders, then the layout follows a 2-panel structure: center article body (max-w-4xl, centered) and right metadata rail (w-80)
- [ ] Given the article body, when it renders markdown content, then headings use Space Grotesk, body text uses Literata, code blocks use Space Mono, and blockquotes have a left border in `primary-container` color (blockquote borders are exempt from the No-Line Rule as they are content styling, not layout sectioning)
- [ ] Given the session header metadata, when it renders, then it displays date, time, project badge, session ID, and a more-actions button
- [ ] Given the right metadata rail, when it renders, then it displays: Outline (with nested heading links), Backlinks (with preview cards), and Stats/Activity (word count, read time, sync status)
- [ ] Given the tags section at the bottom of the article, when it renders, then tags are displayed as pill-shaped badges with `surface-container` background and `outline-variant/20` border

### F. Agents Directory (Screen 3)
- [ ] Given the Agents Directory page, when it renders, then the layout follows a 3-panel structure: left category rail (w-64), main agent grid (flex-grow), right node status panel (w-80, hidden on smaller screens)
- [ ] Given the agent cards in the grid, when they render, then each card displays: emoji/icon, category badge (CORE/SPECIALIST/UTILITY/ARCHIVAL), agent name, model name, description, and CONFIGURE/DEPLOY action buttons
- [ ] Given the left category rail, when it renders, then it displays: Registry header with description, category filter buttons with counts, and Active Deployments with progress indicator
- [ ] Given the right node status panel, when it renders, then it displays: Compute Load and Token Pool progress bars, Real-time Stream (log entries with timestamps), and System Core card

### G. Analytics Dashboard (Screen 4)
- [ ] Given the Analytics Dashboard page, when it renders, then it displays a header with title, description, and a segmented time-range control (7D/30D/90D)
- [ ] Given the summary cards grid, when it renders, then it displays 4 cards: Total Sessions, Tokens Processed, Accumulated Cost, Avg Session Cost — each with a colored left border, large number, and trend indicator
- [ ] Given the temporal distribution chart, when it renders, then it displays a vertical bar chart with hover tooltips showing values, using `surface-container-highest` for bars and `primary-container` for the highlighted bar
- [ ] Given the agent influence ratio chart, when it renders, then it displays horizontal progress bars for each agent with session counts, using varying opacity of the primary color
- [ ] Given the resource intensity panel, when it renders, then it displays LPU Utilization, Memory Buffering, and Context Window Cache progress bars with a note card below

### H. Topics PARA (Screen 5)
- [ ] Given the Topics page, when it renders, then the layout follows a 3-panel structure: left PARA category sidebar (w-64), main magazine grid (flex-grow), right metadata/terminal rail (w-80)
- [ ] Given the PARA category sidebar, when it renders, then it displays 4 category cards (Projects/Areas/Resources/Archives) each with a colored left border (4px), category name, description, and count
- [ ] Given the main magazine grid, when it renders, then it displays a featured card (spans full width, 16:10 image + text side-by-side on desktop) and smaller article cards in a bento grid layout (`grid-cols-12`: regular articles span `md:col-span-6`, small articles span `md:col-span-4`) with category badges and read times
- [ ] Given the right metadata rail, when it renders, then it displays: Topic Metadata (total topics, words indexed, last mutation, sync status), Relation Graph placeholder, and Lexicon Shell terminal

### I. Migration Tool (Screen 6)
- [ ] Given the Migration page, when it renders, then it displays a 4-step wizard progress indicator (Configure → Preview → Migrate → Complete) with the current step highlighted
- [ ] Given the configuration form, when it renders, then it displays Source Definition (Origin Node input, Protocol dropdown, Path Selector) and Transformation Rules (toggle switches for Auto-link Entities, Lossless Compression)
- [ ] Given the manifest summary panel, when it renders, then it displays Selected Files count, Estimated Payload size, Encryption Layer status, and a "PREVIEW BATCH" gradient button
- [ ] Given the cluster performance history section, when it renders, then it displays 3 stat cards: Avg Transfer Speed, Integrity Checks, Total Vault Migrated
- [ ] Given the terminal log view, when it renders, then it displays a macOS-style window chrome (three circle indicators: red `#ff5f57`, yellow `#febc2e`, green `#28c840`, each 10px diameter with 6px gap, positioned top-left with 16px padding) with timestamped log entries colored by level (SYSTEM=tertiary, INFO=primary-container, WARN=secondary) and a blinking cursor

### J. Setup Onboarding (Screen 7)
- [ ] Given the Setup page, when it renders, then it displays a centered full-screen layout (no sidebar) with ambient background decoration (blurred gradient circles)
- [ ] Given the setup card, when it renders, then it displays: step indicators (01/02/03), "Connect Your Knowledge" heading, Knowledge Base Path input with folder picker button, detected structure preview (a 2-column bento grid: left column shows 3 file/folder entries with Material icon + monospace path, right column shows document count as large number with "Documents" label below), and document count
- [ ] Given the CTA footer of the setup card, when it renders, then it displays an "Advanced Settings" ghost link and an "Initialize Link" gradient button
- [ ] Given the success modal, when triggered, then it displays a centered glassmorphism modal with check icon, "Vault Synchronized" heading, and confirmation message

### K. Knowledge Graph (Screen 8)
- [ ] Given the Knowledge Graph view, when it renders, then it displays a full-canvas force-directed graph with colored nodes (yellow=Projects, blue=Areas, green=Resources, gray=Archives) and connecting lines
- [ ] Given the graph filter panel, when it renders, then it displays as a floating glassmorphism panel (top-right) with search input and PARA category visibility toggles
- [ ] Given the entity preview card, when a node is selected, then it displays as a floating card (bottom-left) with category badge, title, description, avatars, and "Open File" link
- [ ] Given the zoom controls, when they render, then they display as a floating button group (bottom-right) with zoom in, zoom out, and center focus buttons
- [ ] Given the legend, when it renders, then it displays as a floating panel (bottom-left) with colored dots and labels for each PARA category

### L. Command Palette (Screen 9)
- [ ] Given the Command Palette modal, when triggered, then it displays as a centered overlay with backdrop blur, glassmorphism container, and `>` prefix in the search input
- [ ] Given the search results, when they render, then they are grouped by category (Navigation, Actions, Notes & Research) with category headers in Space Mono uppercase
- [ ] Given the active result, when highlighted, then it displays with `primary/10` background and `primary` left border
- [ ] Given the modal footer, when it renders, then it displays keyboard shortcut hints (↑↓ Navigate, ↵ Open) and result count

### M. Shared Layout Components
- [ ] Given the TopNavBar, when it renders on any page, then it displays: app title "Monolithic Lexicon" in Space Grotesk, search bar with icon, and refresh/settings icon buttons — all on `surface-topbar` (`#161b22`) background with `outline-variant/15` bottom border
- [ ] Given the SideNavBar, when it renders, then it displays: navigation links with Material Symbols icons, active state with `surface-topbar` (`#161b22`) background and `primary-container` (`#58a6ff`) left border, and footer with vault path and connection status — all on `surface-sidebar` (`#0d1117`) background
- [ ] Given the Footer bar, when it renders, then it displays: version number, active sessions count with green dot, file watcher status, and timestamp — all on `surface-sidebar` (`#0d1117`) background with `outline-variant/15` top border, fixed at bottom, 24px height

### N. Component Patterns
- [ ] Given any primary CTA button, when it renders, then it uses a gradient from `primary` to `primary-container` with `on-primary-container` text color, rounded corners, and `active:scale-95` press effect
- [ ] Given any secondary button, when it renders, then it uses `surface-container-highest` background with `outline-variant/15` border
- [ ] Given any ghost button, when it renders, then it has no background, uses `on-surface-variant` text color, and shows `surface-container-high` background on hover
- [ ] Given any status badge, when it renders, then it uses pill shape (`rounded-full`), category color at 15% opacity background with 100% opacity text, and uppercase tracking-wider font
- [ ] Given any command-line input, when it renders, then it has no background, a bottom border in `outline-variant`, a `>` prefix in `primary` color, and transitions the border to `primary` on focus
- [ ] Given any card component, when hovered, then it transitions background from `surface-container-low` to `surface-container-high` with 150ms duration — no transform or shadow changes

### O. Icon Migration
- [ ] Given all icon usage across the application, when the migration is complete, then all icons use Material Symbols Outlined (loaded via Google Fonts `@import`) replacing the current Lucide React icons
- [ ] Given the Material Symbols font, when the application loads, then it is loaded from `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap`
- [ ] Given any Material Symbols icon element, when rendered, then it uses the class `material-symbols-outlined` with configurable `font-variation-settings` for FILL and wght
- [ ] Given the Lucide-to-Material icon mapping, when the migration is complete, then the following mappings are applied: `ClipboardList`→`history`, `Users`→`smart_toy`, `Wrench`→`terminal`, `BookOpen`→`topic`, `Settings`→`settings`, `BarChart3`→`leaderboard`, `ArrowLeftRight`→`move_up`, `PanelLeft`/`PanelLeftClose`→`vertical_split`, `Brain`→`psychology`, `RefreshCw`→`refresh`, `FolderOpen`→`folder_open`, `Info`→`info`, `Link`→`link`, `Hexagon`→`hub`, `List`→`segment`, `MessageSquare`→`chat`, `Bot`→`smart_toy`, `Search`→`search`, `FileText`→`description`, `Keyboard`→`keyboard`, `X`→`close`, `Trash2`→`delete`, `Zap`→`bolt`, `ChevronDown`→`expand_more`, `ChevronRight`→`chevron_right`. For any Lucide icon without a direct Material Symbols equivalent, use the closest semantic match or `help_outline` as fallback.

### P. Build & Performance
- [ ] Given the application build, when running `npm run build`, then the build completes without errors
- [ ] Given the Google Fonts imports, when the application loads offline, then the application remains functional with fallback system fonts (no blank screen or broken layout) using these explicit fallback stacks: `Space Grotesk, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` for headlines, `Space Mono, 'SF Mono', 'Fira Code', 'Cascadia Code', monospace` for mono, and `Literata, Georgia, 'Times New Roman', serif` for serif
- [ ] Given the application bundle size, when measured after migration, then the JavaScript bundle size does not increase by more than 20KB gzipped compared to pre-migration baseline (baseline to be recorded by running `npm run build` and noting the `dist/` total size before any UI changes begin)

### Q. Backward Compatibility
- [ ] Given the existing data models (notes, sessions, agents, skills, topics), when the UI migration is complete, then all data continues to load and display correctly with the new UI
- [ ] Given the existing Dexie database schema, when the migration is complete, then no database migrations are required
- [ ] Given the existing Zustand stores, when the migration is complete, then all store interfaces remain unchanged
- [ ] Given the existing TipTap editor, when the migration is complete, then the editor toolbar uses `surface-container` background, toolbar buttons use the ghost button pattern from AC N3 (no background, `on-surface-variant` text, `surface-container-high` on hover), editor body text uses Literata font (`font-serif`), placeholder text uses `outline` color in italic, code blocks use `surface-container-lowest` background with `outline-variant/30` border, and wikilink suggestions use `surface-container-highest` background with `outline-variant/15` border

## Constraints

### Technical
- Must use React 19 + TypeScript + Vite 8 + Tailwind CSS v4 (no framework changes)
- Must use Zustand for state management (no state management changes)
- Must use Dexie for IndexedDB storage (no storage layer changes)
- Must use TipTap for the editor (no editor changes)
- Google Fonts must be loaded via `@import` in CSS (no external script tags in HTML)
- Material Symbols Outlined replaces Lucide React for all UI icons
- The application must remain functional offline with fallback fonts if Google Fonts are unavailable
- No external CDN dependencies for images — placeholder images in mockups must be replaced with local assets or removed
- All existing route paths must remain unchanged (no routing changes)

### Design
- Background color must be `#10141a` (new Monolithic Lexicon background)
- The "No-Line Rule" must be enforced: no 1px solid borders for layout sectioning
- PARA category colors must be used exactly as specified: Projects `#d29922`, Areas `#58a6ff`, Resources `#3fb950`, Archives `#484f58`
- Primary text color must be `#e6edf3` (not pure white)
- Card radius must be `10px` (`0.625rem` / `rounded-lg`)
- Badge radius must be `full` (`rounded-full`)
- Transition duration for hover states must be `150ms`

### Business
- The application must remain a local-first knowledge management tool
- Dark theme is the only theme for this iteration (no light theme)
- All 9 screens from the Stitch mockups must be implemented
- Screens not in mockups (Topic Detail, Agent Detail, Skills, Configs, OpenCode, Not Found) must be updated to match the new design system

## Edge Cases & Error States

### Empty States
- **Sessions (0 sessions):** Display centered empty state with `history` Material icon (48px, `outline-variant` color), "No sessions yet" heading in Space Grotesk, "Run your first AI coding session to see it here" description in Literata, and a "View Agents" gradient button
- **Agents (0 agents):** Display centered empty state with `smart_toy` Material icon, "No agents configured" heading, description text, and "Set up your data folder" ghost button
- **Topics (0 topics):** Display centered empty state with `topic` Material icon, "Knowledge base is empty" heading, description text, and "Create your first topic" gradient button
- **Stats (no data):** Display summary cards with `—` placeholder values, empty bar charts with "No data available" centered text, and disabled time-range selector
- **Graph (0 nodes):** Display centered "No connections yet" message with `hub` Material icon. Graph (1 node): Display single node centered with label, no connecting lines

### Loading States
- **All list pages:** Display skeleton loaders matching the shape of the content they replace — shimmer animation (`bg-surface-container-high` with animated gradient), 3-5 skeleton items for lists, 4 skeleton cards for grids
- **Session/Topic/Agent detail pages:** Display skeleton header (wide bar + 3 narrow bars) and skeleton body (8-10 lines of varying width)
- **Stats page:** Display skeleton summary cards (4 rectangles with shimmer) and skeleton chart areas (large rectangle with shimmer)
- **Setup page:** Display skeleton structure preview (3 file entries with shimmer) while scanning folder

### Error States
- **Data load failure:** Display centered error state with `error_outline` Material icon (48px, `error` color), "Failed to load data" heading, error message in monospace, and "Retry" gradient button
- **Server disconnected:** Display banner at top of page (below TopNavBar) with `warning` Material icon, "Connection lost — attempting to reconnect..." message on `error-container/20` background with `error` text
- **Migration failure:** Display error card within wizard with `error_outline` icon, error details in monospace code block, and "Try Again" button. Progress resets to 0%
- **Font load failure:** Application remains fully functional with fallback system fonts. No error displayed. Layout does not break.

### Boundary Conditions
- **Graph with 10,000+ nodes:** Force simulation throttled to 30fps. Node labels hidden by default, shown only on hover. Filter panel defaults to showing only Projects and Areas categories
- **Pagination with 1 page:** Pagination footer still renders but prev/next buttons are disabled and page number section shows only "1"
- **Very long session titles:** Truncated with ellipsis after 2 lines (`line-clamp-2`), full title shown on hover via tooltip
- **Zero-cost sessions:** Display `$0.00` in `on-surface-variant` color (not green)

## Out of Scope

- Light theme support (dark theme only)
- Mobile-responsive adaptations (desktop-first, minimum 1280px viewport assumed)
- Changes to the data layer, storage schema, or API contracts
- Changes to the TipTap editor's core functionality or plugin configuration
- Changes to the knowledge graph algorithm or D3.js force simulation logic
- Changes to the search algorithm or Fuse.js configuration
- Changes to the Zustand store interfaces or Dexie schema
- Custom icon design (only Material Symbols Outlined from Google Fonts)
- Animation or motion design beyond the specified 150ms hover transitions
- Internationalization or locale-specific adaptations
- User-configurable themes or color customization
- Changes to the CLI tooling (`bin/akl.js`, `scripts/seed-notes.ts`)
- Changes to the test infrastructure (Vitest, Playwright)
- Image assets from mockups (Google-hosted images) — must be replaced with local placeholders or removed
- The `monolith_dark` folder in Stitch contains only DESIGN.md — no additional screen to implement

## Related Decisions

- **New Design System** (`docs/ai/requirements/new-design-system.md`): Previous requirement for replacing emoji icons with Lucide SVG icons. This new requirement supersedes it by replacing Lucide with Material Symbols Outlined and overhauling the entire design system.
- **OpenCode Hub and Obsidian Flow** (`docs/ai/requirements/opencode-hub-and-obsidian-flow.md`): Unrelated feature requirement.
- **CLI Packaging** (`docs/ai/requirements/cli-packaging.md`): Unrelated infrastructure requirement.

## Implementation Phases

### Phase 1: Foundation (Design Tokens + Typography)
1. Update `src/index.css` with Monolithic Lexicon color tokens in Tailwind `@theme`
2. Add Google Fonts `@import` for Space Grotesk, Space Mono, Literata, Material Symbols
3. Update Tailwind font family configuration
4. Update border radius tokens
5. Update utility classes (`.sb-card`, `.sb-btn`, `.sb-input`, `.sb-tag`) to match new design

### Phase 2: Shared Layout Components
1. Redesign TopNavBar component
2. Redesign SideNavBar component
3. Redesign Footer bar component
4. Create shared layout shell component

### Phase 3: Core Screens (from Stitch mockups)
1. Sessions Dashboard
2. Session Detail
3. Agents Directory
4. Analytics Dashboard (Stats)
5. Topics (PARA)
6. Migration Tool
7. Setup Onboarding
8. Knowledge Graph
9. Command Palette

### Phase 4: Remaining Screens
1. Topic Detail
2. Agent Detail
3. Skills Page
4. Configs Page
5. OpenCode Page
6. Not Found Page

### Phase 5: Polish & Verification
1. Verify all acceptance criteria
2. Test offline font fallback
3. Verify build succeeds
4. Verify all existing functionality works
