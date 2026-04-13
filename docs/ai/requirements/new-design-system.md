# Requirement: New Design System

**Date:** 2026-04-12
**Status:** Draft
**Author:** Scribe
**Reviewed by:** Oracle (2026-04-12)

## User Story

As a user of AKL's Knowledge, I want all emoji icons replaced with SVG icons from a single, consistent icon library so that every icon in the application shares uniform sizing (24x24 viewBox), stroke width (2px), and color behavior (via `currentColor`) across all components.

## Context

The application currently uses:
- **Design tokens:** `sb-` prefixed CSS custom properties defined in `src/index.css` (colors, shadows, radii, typography)
- **Theme:** Dark theme, GitHub-inspired (`#0d1117` background)
- **Icons:** Emoji characters used inline across 11 components (Sidebar, TopBar, SearchBar, CommandPalette, RightPanel, BacklinksPanel, NoteInfoPanel, AgentDetailPage, AgentsPage, SkillsPage, ShortcutHelp)
- **Styling:** Tailwind CSS v4 with `@theme` directive for custom tokens
- **Framework:** React 19 + TypeScript + Vite 8

### Current Baselines
| Metric | Value | Measurement Method |
|--------|-------|--------------------|
| Total emoji instances | 15 unique emojis across 11 components | Code audit (see emoji table below) |
| JavaScript bundle size (gzipped) | _To be measured before implementation_ | `npm run build` + `npx vite-bundle-visualizer` |
| Time to Interactive (TTI) | _To be measured before implementation_ | Lighthouse CI or Chrome DevTools |
| Cumulative Layout Shift (CLS) | _To be measured before implementation_ | Lighthouse CI or Chrome DevTools |

> **Note:** Baselines must be recorded and added to this table before implementation begins. All performance acceptance criteria reference these values.

### Emoji Inventory

#### Navigation Icons (Sidebar)
| Emoji | Location | Semantic Meaning |
|-------|----------|-----------------|
| 📁 | Sidebar | File explorer / Notes |
| 📋 | Sidebar | Sessions |
| 👥 | Sidebar | Agents |
| 🛠️ | Sidebar | Skills |
| 📚 | Sidebar | Topics |
| ⚙️ | Sidebar | Configs / Settings |
| 📊 | Sidebar | Stats |
| 🔄 | Sidebar | Migration |

#### Header Icons (TopBar)
| Emoji | Location | Semantic Meaning |
|-------|----------|-----------------|
| ☰ | TopBar | Menu open (collapsed state) |
| ◀ | TopBar | Menu close (expanded state) |
| 🧠 | TopBar | Brand logo |
| ↻ | TopBar | Refresh / Reload |
| ⚙️ | TopBar | Settings |

#### Search & Command Icons
| Emoji | Location | Semantic Meaning |
|-------|----------|-----------------|
| 🤖 | SearchBar | Agent result type |
| 🛠️ | SearchBar | Skill result type |
| 📚 | SearchBar | Topic result type |
| ⚙️ | SearchBar | Config result type |
| 📄 | SearchBar, CommandPalette | Note result type |
| ⚡ | CommandPalette | Quick action / Command |

#### Panel Icons (RightPanel, BacklinksPanel, NoteInfoPanel)
| Emoji | Location | Semantic Meaning |
|-------|----------|-----------------|
| ℹ️ | RightPanel | Info panel tab |
| 🔗 | RightPanel, BacklinksPanel | Backlinks / Links tab |
| ⬡ | RightPanel | Graph view tab |
| 📑 | RightPanel | Outline tab |
| 🗑️ | NoteInfoPanel | Delete action |

#### Page & Dialog Icons
| Emoji | Location | Semantic Meaning |
|-------|----------|-----------------|
| 🤖 | AgentsPage, AgentDetailPage | Agent header / cards |
| 🛠️ | SkillsPage | Skill cards |
| ⌨️ | ShortcutHelp | Keyboard shortcuts header |
| ✕ | ShortcutHelp | Close button |

#### Status Indicators (replaced with colored div elements, NOT icons)
| Emoji | Location | Semantic Meaning | Replacement Strategy |
|-------|----------|-----------------|---------------------|
| 🟢 | Sidebar, StatusBar | Active / Watching | Colored `div` with `border-radius: 50%` + `background-color: var(--color-sb-success)` |
| 🔴 | Sidebar, StatusBar | Error | Colored `div` with `border-radius: 50%` + `background-color: var(--color-sb-error)` |
| ⚪ | Sidebar, StatusBar | Idle / Inactive | Colored `div` with `border-radius: 50%` + `background-color: var(--color-sb-text-muted)` |

#### Empty State Icons (out of scope — decorative, not part of navigation)
| Emoji | Location | Semantic Meaning | Status |
|-------|----------|-----------------|--------|
| 🧠 | NoteEditor (empty state), SetupPage | Brand / Welcome | Out of scope — decorative empty state illustration |
| ❌ | MigrationPage | Migration failed status | Out of scope — status text decoration, not a navigation icon |

## Acceptance Criteria

### Icon Library Integration
- [ ] Given the application bundle, when analyzing the final JavaScript size, then the icon library adds no more than 15KB gzipped to the bundle
- [ ] Given a component that previously rendered an emoji icon, when the component is rendered, then it displays an inline `<svg>` element from the chosen library instead of an emoji character, and the SVG icon conveys the same semantic meaning as the original emoji per the emoji-to-icon mapping table
- [ ] Given the icon library is installed, when running `npm run build`, then the build completes without errors and unused icons are tree-shaken from the final bundle (verified by bundle analysis showing only imported icons present)
- [ ] Given an icon is rendered in any component, when inspecting the DOM, then the icon is an inline `<svg>` element (not an icon font, image, or external resource)
- [ ] Given an emoji with no direct SVG equivalent in the chosen library, when the component renders, then a semantically appropriate alternative icon is used and the mapping is documented in an emoji-to-icon mapping table in `docs/ai/requirements/`

### Emoji Replacement Coverage

#### Sidebar Navigation
- [ ] Given the Sidebar component, when it renders navigation items, then each item displays an SVG icon replacing: 📁 (Notes), 📋 (Sessions), 👥 (Agents), 🛠️ (Skills), 📚 (Topics), ⚙️ (Configs), 📊 (Stats), 🔄 (Migration)
- [ ] Given the Sidebar component, when it renders the collapse/expand toggle button, then the toggle displays an SVG icon replacing ☰ (collapsed state) and ◀ (expanded state)

#### TopBar Header
- [ ] Given the TopBar component, when it renders, then the brand area displays an SVG icon replacing 🧠 (brand logo, marked as decorative with `aria-hidden="true"`)
- [ ] Given the TopBar component, when it renders, then the refresh button displays an SVG icon replacing ↻
- [ ] Given the TopBar component, when it renders, then the settings button displays an SVG icon replacing ⚙️

#### Search & Command Palette
- [ ] Given the SearchBar component, when it renders search results, then type icons for agent, skill, topic, config, and note replace 🤖, 🛠️, 📚, ⚙️, 📄 with SVG equivalents
- [ ] Given the CommandPalette component, when it renders results, then icons replace 📄 (note) and ⚡ (command) with SVG equivalents

#### Right Panel & Sub-Panels
- [ ] Given the RightPanel component, when it renders tab buttons, then icons replace ℹ️ (Info), 🔗 (Links), ⬡ (Graph), 📑 (Outline) with SVG equivalents
- [ ] Given the BacklinksPanel component, when it renders, then the backlinks header icon replaces 🔗 with an SVG equivalent
- [ ] Given the NoteInfoPanel component, when it renders, then the delete action icon replaces 🗑️ with an SVG equivalent

#### Pages & Dialogs
- [ ] Given the ShortcutHelp component, when it renders, then the header icon replaces ⌨️ with an SVG equivalent
- [ ] Given the ShortcutHelp component, when it renders, then the close button replaces ✕ with an SVG `X` icon
- [ ] Given the AgentsPage component, when it renders agent cards, then each agent displays an SVG icon replacing 🤖
- [ ] Given the AgentDetailPage component, when it renders, then the agent header displays an SVG icon replacing 🤖
- [ ] Given the SkillsPage component, when it renders skill cards, then each skill displays an SVG icon replacing 🛠️

#### Status Indicators (colored div elements, NOT SVG icons)
- [ ] Given the Sidebar component, when it renders status indicators for each navigation item, then each status is displayed as a `div` element with `border-radius: 50%` and a background color using `sb-success` (active), `sb-error` (error), or `sb-text-muted` (idle) tokens
- [ ] Given the StatusBar component, when it renders the file watcher status, then the status indicator is displayed as a `div` element with `border-radius: 50%` and a background color using `sb-success` (watching), `sb-error` (error), or `sb-text-muted` (idle) tokens

### Visual Consistency
- [ ] Given any icon rendered in the application, when measured, then all icons use a 24x24 viewBox
- [ ] Given any icon rendered in the application, when inspected, then the icon inherits its color from the parent element's `color` CSS property (via `currentColor`)
- [ ] Given icons of different semantic types rendered side by side, when inspected, then all icons use the same stroke width value (2px default, or a single consistent value set via the library's `strokeWidth` prop) and all icons use outline style (not filled or duotone)
- [ ] Given the application in dark theme, when all icons are rendered with `sb-text` or `sb-text-secondary` color tokens, then each icon maintains a minimum contrast ratio of 4.5:1 against its background color
- [ ] Given the existing `sb-` design tokens, when icons are styled, then icon colors use existing token values (`sb-text`, `sb-text-secondary`, `sb-accent`, `sb-success`, `sb-warning`, `sb-error`) rather than hardcoded hex values
- [ ] Given all `sb-*` token names referenced in acceptance criteria, when checked against `src/index.css`, then every referenced token exists and is defined

### Design Token Preservation
- [ ] Given the existing `src/index.css` file, when the design system update is complete, then all existing `sb-` prefixed CSS custom properties remain defined with their original names (values may be refined but names must not change)
- [ ] Given the existing utility classes (`sb-btn`, `sb-card`, `sb-input`, `sb-tag`, `sb-border`, `sb-shadow-*`), when the update is complete, then the computed CSS properties for these classes match their pre-update values for: `background-color`, `border`, `border-radius`, `padding`, `font-size`, `color`, `box-shadow`
- [ ] Given the TipTap editor styles in `src/index.css`, when the update is complete, then the computed CSS properties for `.ProseMirror` and its descendants (h1-h6, `pre`, `code`, `blockquote`, `.wikilink`) match their pre-update values for: `font-size`, `font-weight`, `color`, `margin`, `padding`, `border`, `background-color`

### Error Handling
- [ ] Given the icon library package fails to install or import, when running `npm run build`, then the build fails with a clear error message (no silent fallback to emoji)
- [ ] Given an icon component receives an invalid or undefined icon name at runtime, when the component renders, then it renders nothing (empty output) without throwing a JavaScript error

### Performance
- [ ] Given the application loads for the first time, when measuring Time to Interactive, then the value does not increase by more than 100ms compared to the pre-update baseline recorded in the Context section
- [ ] Given the icon library is used across components, when the application is running, then icon rendering causes no layout shift (CLS contribution from icons is 0)

### Accessibility
- [ ] Given an icon that conveys semantic meaning (not decorative), when inspected, then the SVG element includes an `aria-label` attribute or is paired with visible text that describes the icon's meaning
- [ ] Given a decorative icon, when inspected, then the SVG element includes `aria-hidden="true"`
- [ ] Given interactive elements that contain icons (buttons, links), when navigated via keyboard, then the focus indicator encompasses both the icon and its associated text, with a minimum contrast ratio of 3:1 against adjacent colors and a minimum thickness of 2 CSS pixels (per WCAG 2.2 criterion 2.4.13)

## Constraints

### Technical
- Icon library must be SVG-based (no icon fonts, no image sprites)
- Icon library must support ES Module tree-shaking to minimize bundle size
- Icon library must be compatible with React 19 and TypeScript 5.x
- Icon library must be installable via npm and work with Vite 8
- All existing `sb-` CSS custom property names must be preserved (values may be refined)
- Tailwind CSS v4 `@theme` configuration must remain functional
- No CSS selectors matching `.ProseMirror` or its descendants may be modified, except for icon replacements within non-editor UI elements

### Business
- The application must remain a local-first knowledge management tool (no external CDN dependencies for icons or fonts)
- The dark theme must remain the default and only theme for this iteration
- Background color must remain `#0d1117` or a value within 5% luminance difference
- Border colors must remain within the existing `sb-border` token family (no new border color tokens introduced without justification)

### Performance
- Icon library bundle contribution must not exceed 15KB gzipped
- No increase in Cumulative Layout Shift from icon rendering (CLS delta = 0)
- Time to Interactive must not increase by more than 100ms from baseline

## Out of Scope

- Light theme support (dark theme only for this iteration)
- Custom icon design or creation (only use icons from the chosen library)
- Animation or motion design for icons (static icons only)
- Changes to the TipTap editor's content rendering, toolbar, or `.ProseMirror` CSS
- Changes to the knowledge graph visualization
- Changes to the data layer, storage, or API contracts
- Changes to routing or navigation logic
- Internationalization or locale-specific icon variants
- Icon customization by end users (e.g., choosing custom emojis for agents/skills)
- Changes to the scrollbar styling, selection colors, or base typography
- Responsive layout changes or mobile-specific adaptations
- Color palette refinements beyond icon color token usage (color token value changes are a separate future iteration)
- Empty state decorative emojis (🧠 in NoteEditor empty state, 🧠 in SetupPage) — these are decorative illustrations, not navigation icons
- Migration page status text decoration (❌ in "Migration Failed" text) — this is text styling, not an icon replacement
- Agent and skill frontmatter `emoji` field values — these are user-configurable data fields, not hardcoded UI icons

## Related Decisions

- No past decisions found in project memory regarding design system, icons, styling, or theme.
- This is the first formal design system specification for the project.
- No design proposal document exists at time of writing; this requirement document serves as the sole design specification.
