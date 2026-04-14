# Requirement: OpenCode Hub Tab and Obsidian-Like Knowledge Flow

**Date:** 2026-04-13
**Status:** Reviewed
**Author:** Scribe

## Context

The application (AKL Knowledge / second-brain) currently displays opencode-related content across separate sidebar navigation items: **Agents**, **Skills**, **Configs**, and **Stats**. The user's primary workflow is:

1. Learn and discover topics using opencode CLI (conversations with AI agents)
2. Have that knowledge automatically captured and stored
3. Visualize and explore the accumulated knowledge on the web dashboard — similar to how Obsidian serves as a second brain

The user wants two changes:
1. **Consolidation**: Group all opencode meta-content (Agents, Skills, Configs) into a single "OpenCode" tab in the sidebar
2. **Obsidian-like flow**: Make the app automatically capture, link, and visualize knowledge from opencode sessions the way Obsidian does for personal notes

### Obsidian Core Second-Brain Features (Research Findings)

Based on analysis of Obsidian's official documentation and product pages, the features that make Obsidian an effective second-brain tool are:

| Feature | Description | Relevance to This App |
|---------|-------------|----------------------|
| **Internal Links (Wikilinks)** | `[[note-name]]` syntax creates bidirectional connections between any notes | Already partially supported via `relatedSessions`, `relatedTopics` in frontmatter |
| **Graph View** | Interactive visualization showing all notes as nodes and links as edges | Already exists as `MiniGraph` component but limited to 30 nodes, circular layout |
| **Backlinks Panel** | Shows all notes that link to the current note | Already exists as `BacklinksPanel` component |
| **Tags** | `#tag` syntax for organizing content across folders | Already supported in frontmatter `tags[]` field |
| **Canvas** | Infinite 2D space for arranging notes, images, and connections | Not implemented |
| **Daily Notes** | Auto-created dated notes for capturing daily thoughts | Not implemented |
| **Local-first Markdown** | All data stored as plain `.md` files on device | Already implemented — filesystem as database |
| **Full-text Search** | Instant search across all note content and metadata | Already implemented via Fuse.js |
| **Outline/TOC** | Document structure navigation via heading hierarchy | Already exists as Outline tab in RightPanel |
| **Plugin Ecosystem** | Extensible functionality via community plugins | Not applicable (local-first web app) |

### Current Sidebar Structure

```
Sidebar (current):
├── Sessions        ← Core content (opencode conversations)
├── Agents          ← OpenCode meta-content
├── Skills          ← OpenCode meta-content
├── Topics          ← Knowledge articles (user-created)
├── Configs         ← OpenCode meta-content
├── Stats           ← OpenCode meta-content (analytics)
└── Migration       ← Utility (one-time use)
```

### Proposed Sidebar Structure

```
Sidebar (proposed):
├── Sessions        ← Core content (opencode conversations)
├── OpenCode        ← Consolidated: Agents, Skills, Configs as sub-sections
├── Topics          ← Knowledge articles (user-created)
├── Stats           ← Analytics dashboard
└── Migration       ← Utility (one-time use)
```

## User Stories

### User Story 1: OpenCode Hub Consolidation
As a user of AKL Knowledge, I want all opencode-related meta-content (Agents, Skills, Configs) grouped under a single "OpenCode" navigation tab so that I can access all opencode configuration and team information from one place without navigating between multiple sidebar items.

### User Story 2: Automatic Knowledge Capture from Sessions
As a user who learns through opencode conversations, I want key findings, decisions, and extracted knowledge from sessions to be automatically surfaced as discoverable knowledge entries so that I don't have to manually create Topics for every insight.

### User Story 3: Knowledge Graph Visualization
As a user building a second brain, I want an interactive graph view that shows relationships between sessions, topics, agents, and skills so that I can visually discover connections in my accumulated knowledge.

### User Story 4: Backlink Discovery
As a user exploring my knowledge base, I want to see which sessions and topics reference or relate to the current item so that I can navigate through my knowledge network naturally.

## Acceptance Criteria

### OpenCode Hub Tab

- [ ] Given the Sidebar component, when it renders navigation items, then a single "OpenCode" item replaces the separate "Agents", "Skills", and "Configs" items
- [ ] Given the user clicks the "OpenCode" navigation item, when the route loads, then a hub page displays at `/opencode` with three sub-sections: Agents, Skills, and Configs
- [ ] Given the OpenCode hub page, when it renders, then each sub-section displays a summary count computed from the IndexedDB cache (e.g., "13 agents", "24 skills", "5 configs") and links to the full list view for that type
- [ ] Given the OpenCode hub page, when the user clicks a sub-section, then the view navigates to the existing full list page (`/agents`, `/skills`, `/configs`) or displays the list inline within the hub
- [ ] Given the keyboard chord `g` then `o` (press g, release, then press o), when pressed, then the user navigates to `/opencode`
- [ ] Given the existing routes `/agents`, `/skills`, `/configs`, when accessed directly by URL, then they continue to function as before (backward compatibility)
- [ ] Given the existing keyboard shortcuts `g+a`, `g+k`, `g+c`, when pressed, then they continue to navigate to `/agents`, `/skills`, `/configs` respectively (backward compatibility)
- [ ] Given the OpenCode hub page, when a sub-section has zero items, then it displays "No agents found", "No skills found", or "No configs found" respectively with a count of 0

### Automatic Knowledge Extraction from Sessions

- [ ] Given a session markdown file contains a `## Key Findings` section, when the dashboard loads, then each finding is indexed as a discoverable knowledge snippet linked to its parent session
- [ ] Given a session markdown file contains a `## Files Modified` section, when the dashboard loads, then each modified file is indexed as a reference linked to its parent session
- [ ] Given a session markdown file contains a `## Next Steps` section, when the dashboard loads, then each action item is indexed as a task linked to its parent session
- [ ] Given a session's frontmatter contains `relatedTopics`, when viewing the session detail, then links to those topics are displayed in a "Related Knowledge" section
- [ ] Given the file indexing process runs, when it completes, then knowledge snippets from `## Key Findings`, `## Files Modified`, and `## Next Steps` are available via the API without a separate indexing pass
- [ ] Given a session's frontmatter contains `outcome`, when viewing the session list, then the outcome text is displayed as a preview alongside the session title
- [ ] Given the dashboard processes sessions, when a session has no `## Key Findings` section, then no knowledge snippets are extracted for that session (no false positives)
- [ ] Given the dashboard processes sessions, when a session has no `## Files Modified` section, then no file references are extracted for that session (no false positives)
- [ ] Given the dashboard processes sessions, when a session has no `## Next Steps` section, then no action items are extracted for that session (no false positives)

### Enhanced Knowledge Graph

- [ ] Given the Graph view component, when it renders, then it displays nodes for Sessions, Topics, Agents, and Skills (not just notes)
- [ ] Given the Graph view component, when a node is clicked, then the application navigates to the detail page for that entity
- [ ] Given the Graph view component, when it renders edges, then edges represent: `relatedSessions` links, `relatedTopics` links, `sourceSession` links, and `agentsUsed` links
- [ ] Given the Graph view component, when rendering nodes, then each node type uses a distinct color (Sessions: blue, Topics: green, Agents: purple, Skills: orange)
- [ ] Given the Graph view component, when the user hovers over a node, then a tooltip displays the entity name and type
- [ ] Given the Graph view component, when there are 100 or more nodes, then the graph uses a force-directed layout algorithm instead of circular layout
- [ ] Given the Graph view component, when the user filters by entity type, then only nodes of the selected type and their direct connections are displayed
- [ ] Given the Graph view component, when there are 0 nodes, then an empty state message is displayed: "No knowledge graph yet. Knowledge will appear after you create sessions with opencode"
- [ ] Given the Graph view component, when there is exactly 1 node, then the node is displayed centered with no edges

### Backlink and Relationship Display

- [ ] Given a Session detail page, when it renders, then a "Backlinks" section displays all sessions that reference this session via `parentSession` or `relatedSessions`
- [ ] Given a Topic detail page, when it renders, then a "Backlinks" section displays all sessions that produced this topic via `sourceSession` and all topics that reference it via `relatedTopics`
- [ ] Given an Agent detail page, when it renders, then a "Used In" section displays the top 10 most recent sessions that used this agent
- [ ] Given a Skill detail page, when it renders, then a "Used In" section displays the top 10 most recent sessions that used this skill

## Constraints

### Technical
- The application is a React 19 + TypeScript + Vite 8 web application
- Data is stored as markdown files with YAML frontmatter (filesystem as database)
- IndexedDB (Dexie) is used for client-side caching and search indexing
- Fuse.js is used for fuzzy search
- The graph component currently uses a simple circular SVG layout (not force-directed)
- No external API calls — all data is local-first
- Tailwind CSS v4 is used for styling with `sb-` design tokens

### Business
- The app remains a read-only visualization dashboard — all content creation happens via opencode CLI
- The dark theme remains the default and only theme
- No external CDN dependencies — fully offline-capable
- Existing routes and keyboard shortcuts must remain functional (backward compatibility)

### Performance
- The graph view must maintain ≥30fps during user interaction (pan, zoom, node drag) with up to 500 nodes
- The graph view initial render must complete in <2s with up to 500 nodes
- Given 500 nodes with force-directed layout, when rendered, then initial layout computation completes in <2s and interaction remains ≥30fps
- Page load time must not increase by more than 200ms after adding the OpenCode hub
- Knowledge extraction must happen during the existing file indexing phase (no separate background process)

## Out of Scope

- Canvas-like infinite 2D workspace for brainstorming
- Daily notes auto-creation feature
- Plugin/extension system
- Content editing within the dashboard (remains read-only)
- Real-time sync with opencode CLI (file watcher already handles this)
- Light theme support
- Mobile-responsive layout changes
- Changes to the data model schema or frontmatter structure
- Changes to the TipTap editor or markdown rendering
- Migration tool modifications
- Custom user-defined entity types beyond Sessions, Topics, Agents, Skills, Configs
- Natural language processing or AI-based content summarization (only extract explicitly marked sections)
- Export or publishing functionality (like Obsidian Publish)

## Related Decisions

- **OMC Knowledge Architecture** (`docs/specs/2025-04-12-omc-knowledge-architecture.md`) — Defines the complete data model, file organization, and relationship types for all content types
- **New Design System** (`docs/ai/requirements/new-design-system.md`) — Defines the icon library, design tokens, and visual consistency requirements
- The application already has backlinks panel, graph view, and outline components — this requirement enhances and integrates them rather than building from scratch
- The `relatedSessions`, `relatedTopics`, `sourceSession`, and `agentsUsed` frontmatter fields already exist and provide the relationship data needed for backlinks and graph edges
