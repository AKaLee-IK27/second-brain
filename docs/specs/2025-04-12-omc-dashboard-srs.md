# Software Requirements Specification — OMC Knowledge Dashboard

> **Document ID:** SRS-OMC-2025-04-12  
> **Version:** 1.0  
> **Status:** Approved for Implementation  
> **Created:** 2025-04-12  
> **Author:** Scribe (Requirements Architect)  
> **Stakeholders:** User (Khoi Le), Development Team (all agents)  
> **References:** [Knowledge Architecture](./2025-04-12-omc-knowledge-architecture.md)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Requirements](#6-data-requirements)
7. [API Specification](#7-api-specification)
8. [Implementation Plan](#8-implementation-plan)
9. [Testing Strategy](#9-testing-strategy)
10. [Appendix](#10-appendix)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the complete software requirements for the **OMC Knowledge Dashboard** — a React + TypeScript + Vite + Tailwind CSS web application that visualizes, arranges, and displays all knowledge stored as markdown files in the user's filesystem. The dashboard serves as a read-only window into the user's OMC (oh-my-claudecode) agent sessions, agent definitions, skill definitions, knowledge articles, and configuration files.

This document is the **single source of truth** for the entire development team. Every developer, designer, tester, and AI agent MUST reference this specification before implementing, designing, or testing any feature.

### 1.2 Scope

#### In Scope

| Area | Description |
|------|-------------|
| **Markdown File Reading** | Parse `.md` files with YAML frontmatter from a user-selected local directory |
| **Session Visualization** | Browse, search, filter, and read 321+ conversation sessions |
| **Agent Visualization** | Display agent cards, team roster, and detailed agent definitions |
| **Skills Browser** | List and view all skill definitions with filtering |
| **Config Viewer** | Display opencode configuration files in readable format |
| **Topics/Blogs Viewer** | Browse and read knowledge articles with markdown rendering |
| **Stats Dashboard** | Show token usage, cost analytics, agent activity, and trends |
| **Global Search** | Full-text search across all content types with weighted results |
| **Migration Tool** | Convert existing SQLite sessions to markdown files |
| **File Watching** | Auto-refresh UI when markdown files change on disk |
| **Navigation** | Multi-page navigation with sidebar, routing, and breadcrumbs |

#### Out of Scope

| Area | Rationale |
|------|-----------|
| **Chat/Conversation** | Users interact with agents via `opencode` CLI only |
| **Note Editing/Creation** | All content creation happens via `opencode` CLI |
| **External Data Sync** | No cloud sync, no external API calls for data |
| **User Authentication** | Local-only application, no auth required |
| **Mobile App** | Desktop browser only (responsive design is a bonus, not required) |
| **Database Backend** | Filesystem IS the database; no PostgreSQL/MongoDB/etc. |
| **Real-time Collaboration** | Single-user, local-only application |

### 1.3 Definitions and Acronyms

| Term | Definition |
|------|------------|
| **OMC** | oh-my-claudecode — the agent team framework |
| **SRS** | Software Requirements Specification |
| **Data Root** | The top-level folder containing all knowledge markdown files |
| **Frontmatter** | YAML metadata block at the top of markdown files (between `---` delimiters) |
| **Session** | A single OMC conversation log (user messages + agent responses + tool calls) |
| **Agent** | A member of the OMC team (e.g., Orchestrator, Explorer, Fixer) |
| **Skill** | A capability definition that agents can invoke |
| **Topic** | A knowledge article, blog post, research note, or tutorial |
| **Config** | An OMC configuration file snapshot |
| **Slug** | A URL-friendly identifier (lowercase, kebab-case) |
| **P0/P1/P2** | Priority levels: P0 = Critical/MVP, P1 = Important, P2 = Nice-to-have |
| **RFC 2119** | Standard for requirement language: MUST, SHOULD, MAY |
| **Node Bridge** | The lightweight Node.js Express server that reads filesystem and serves the React app |
| **IndexedDB** | Browser-based database (Dexie) — currently used, MUST be replaced for session data |

### 1.4 References

| Document | Location | Purpose |
|----------|----------|---------|
| Knowledge Architecture | `docs/specs/2025-04-12-omc-knowledge-architecture.md` | Data model specs, file organization, frontmatter standards |
| OMC Agent Definitions | `~/.config/opencode/opencode.jsonc` | Source of truth for agent team |
| OMC Skills | `~/.config/opencode/skills/` | Source of truth for skill definitions |
| SQLite Database | `~/.local/share/opencode/opencode.db` | Source for migration (321 sessions, 6,308 messages) |
| Current Codebase | `/Users/khoi.le/dev/repos/second-brain/` | Existing React app to be pivoted |

### 1.5 RFC 2119 Keyword Conventions

Throughout this document, the following keywords carry specific meaning:

- **MUST** — Absolute requirement. Non-negotiable.
- **MUST NOT** — Absolute prohibition.
- **SHOULD** — Strong recommendation. Deviation requires justification.
- **SHOULD NOT** — Strong discouragement.
- **MAY** — Optional. Permitted but not required.

---

## 2. Overall Description

### 2.1 Product Perspective

The OMC Knowledge Dashboard is a **read-only visualization layer** that sits between the user and their filesystem-based knowledge base. It complements (does not replace) the `opencode` CLI:

```
┌──────────────────────────────────────────────────────────────┐
│                        User (Khoi Le)                         │
├────────────────────────┬─────────────────────────────────────┤
│                        │                                      │
│   opencode CLI         │   OMC Knowledge Dashboard            │
│   (Create/Edit/Chat)   │   (Browse/Search/Visualize)          │
│                        │                                      │
│   ┌────────────────┐   │   ┌──────────────────────────────┐  │
│   │ Terminal UI    │   │   │ React Web App (Vite)         │  │
│   │ Agent commands │   │   │ Node Bridge Server           │  │
│   │ Session mgmt   │   │   │ Markdown Parser              │  │
│   └────────────────┘   │   └──────────────┬───────────────┘  │
│                        │                  │                   │
├────────────────────────┼──────────────────┼───────────────────┤
│                        │                  │                   │
│   ~/.config/opencode/  │   {data-root}/   │                   │
│   opencode.jsonc       │   sessions/      │                   │
│   skills/              │   agents/        │                   │
│   AGENTS.md            │   skills/        │                   │
│                        │   topics/        │                   │
│   ~/.local/share/      │   configs/       │                   │
│   opencode/            │   .second-brain/ │                   │
│   opencode.db          │                  │                   │
│   (migration source)   │                  │                   │
└────────────────────────┴──────────────────┴───────────────────┘
```

**Key relationships:**
- The `opencode` CLI creates and modifies content (sessions, configs)
- The Dashboard reads and visualizes that content
- The Dashboard MUST NOT modify any markdown files (read-only)
- The Migration Tool (F12) is the ONLY exception — it writes markdown files during one-time migration

### 2.2 Product Functions

| ID | Function | Description |
|----|----------|-------------|
| F1 | Directory Selection | Choose and persist a local folder as the data root |
| F2 | Session List View | Browse, search, and filter 321+ sessions |
| F3 | Session Detail View | Read full conversation timeline with markdown rendering |
| F4 | Agent Overview | Display agent cards with roles, models, and permissions |
| F5 | Agent Detail View | Full agent definition with skills and prompt |
| F6 | Skills Browser | List and view all skill definitions |
| F7 | Config Viewer | Display opencode config files |
| F8 | Topics/Blogs Viewer | Browse knowledge articles by category |
| F9 | Topic Detail View | Read full article with markdown rendering |
| F10 | Stats Dashboard | Token usage, cost, agent activity, trends |
| F11 | Search & Filter | Global search across all content types |
| F12 | Migration Tool | Convert SQLite sessions to markdown files |
| F13 | File Watcher | Auto-refresh when markdown files change |
| F14 | Navigation & Routing | Multi-page navigation with sidebar |

### 2.3 User Characteristics

| Characteristic | Description |
|----------------|-------------|
| **Primary User** | Khoi Le — developer, OMC power user |
| **Technical Level** | Expert — comfortable with CLI, filesystem, code |
| **Usage Pattern** | Daily reference, session review, knowledge discovery |
| **Browser** | Modern desktop browser (Chrome, Safari, Firefox) |
| **Screen Size** | Desktop (1280px minimum, 1920px+ preferred) |
| **Session Volume** | 321 existing sessions, growing ~5-10/day |
| **File Volume** | 321 session files + 8 agent files + 40+ skill files + growing topics |

### 2.4 Constraints

| ID | Constraint | Description |
|----|------------|-------------|
| C1 | **No Chat in App** | The web app MUST NOT include any chat interface. All agent interaction happens via `opencode` CLI. |
| C2 | **Read-Only Visualization** | The web app MUST NOT modify, create, or delete any markdown files (except during migration). |
| C3 | **Markdown-First** | All data MUST be stored as `.md` files with YAML frontmatter. No binary databases for content. |
| C4 | **Filesystem as Database** | The user's chosen folder IS the database. No external database server required. |
| C5 | **Local-Only** | The application MUST NOT transmit any data to external servers. All processing is local. |
| C6 | **Node.js Bridge Required** | A lightweight Node.js server MUST run to read filesystem and serve the app (browser cannot read arbitrary local files). |
| C7 | **Existing Codebase** | The app builds on the existing `second-brain` React project. Existing components MAY be reused where applicable. |
| C8 | **Technology Stack** | React 19 + TypeScript + Vite + Tailwind CSS 4 + React Router 7 + Zustand |

### 2.5 Assumptions and Dependencies

| ID | Assumption/Dependency | Description |
|----|----------------------|-------------|
| A1 | Node.js 20+ is installed | Required for the bridge server |
| A2 | SQLite database exists at `~/.local/share/opencode/opencode.db` | Source for migration |
| A3 | OMC config exists at `~/.config/opencode/opencode.jsonc` | Source for agent/skill definitions |
| A4 | Skills exist at `~/.config/opencode/skills/` | Source for skill definitions |
| A5 | User has read access to their filesystem | Required for file reading |
| A6 | Markdown files follow the schema in the Knowledge Architecture doc | Frontmatter structure is standardized |
| A7 | The existing `second-brain` project is functional | Build system, dependencies, and basic structure work |

---

## 3. System Features

### F1: Directory Selection

**Priority:** P0 (Critical — blocks all other features)

**Description:** The user MUST be able to select a local folder as the data root. The selection MUST persist across browser sessions. If no data root is configured, the app MUST show a setup screen.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F1-1 | As a user, I want to select a folder as my data root so that the dashboard knows where to read knowledge files | Given I open the app for the first time, when I see the setup screen, then I MUST see a folder picker or path input field |
| US-F1-2 | As a user, I want my data root selection to persist so that I don't have to re-select it every time | Given I have selected a data root, when I close and reopen the browser, then the app MUST load from the same data root |
| US-F1-3 | As a user, I want to change my data root so that I can switch between different knowledge bases | Given I have a data root configured, when I access settings, then I MUST be able to change the data root path |
| US-F1-4 | As a user, I want to see validation that the selected folder is valid so that I know the dashboard can read it | Given I select a folder, when the folder is validated, then I MUST see either a success message or a specific error explaining why the folder is invalid |

**Data Requirements:**
- Data root path stored in browser `localStorage` under key `omc-data-root`
- Validation MUST check for existence of at least one of: `sessions/`, `agents/`, `skills/`, `topics/`, `configs/`

**UI Requirements:**
- Setup screen with centered card containing:
  - Title: "Select Your Knowledge Base"
  - Description: "Choose the folder containing your OMC knowledge files"
  - Path input field with browse button
  - "Connect" button (disabled until valid path)
  - Validation status indicator (green check / red error)
- Settings modal accessible from sidebar with "Change Data Root" option

**Dependencies:**
- Node.js bridge server endpoint: `POST /api/config/data-root`
- Node.js bridge server endpoint: `GET /api/config/data-root`
- Node.js bridge server endpoint: `POST /api/config/validate-root`

---

### F2: Session List View

**Priority:** P0 (Critical — core feature)

**Description:** Display a browsable, searchable, filterable list of all sessions. Support pagination/virtualization for 321+ sessions. Show key metadata (title, date, agent, tokens, cost, status).

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F2-1 | As a user, I want to see all my sessions in a list so that I can browse my conversation history | Given sessions exist in the data root, when I navigate to Sessions, then I MUST see a list of sessions sorted by date (newest first) |
| US-F2-2 | As a user, I want to filter sessions by agent so that I can see only conversations with a specific agent | Given I select an agent filter, when the list updates, then I MUST see only sessions where `frontmatter.agent` matches the selected agent |
| US-F2-3 | As a user, I want to filter sessions by status so that I can focus on completed, active, or failed sessions | Given I select a status filter, when the list updates, then I MUST see only sessions matching the selected status |
| US-F2-4 | As a user, I want to filter sessions by date range so that I can find sessions from a specific period | Given I set a date range, when the list updates, then I MUST see only sessions where `createdAt` falls within the range |
| US-F2-5 | As a user, I want to filter sessions by tags so that I can find sessions on specific topics | Given I select one or more tags, when the list updates, then I MUST see only sessions containing ALL selected tags |
| US-F2-6 | As a user, I want to sort sessions by different criteria so that I can organize the list by what matters | Given I click a sort header, when the list re-sorts, then I MUST support sorting by: date, title, agent, tokens, cost, duration |
| US-F2-7 | As a user, I want to see session metadata at a glance so that I can quickly identify relevant sessions | Given a session in the list, then I MUST see: title, date, agent name, token count, cost, status badge, and duration |
| US-F2-8 | As a user, I want the list to handle 1000+ sessions without lag so that performance remains good as my knowledge grows | Given 1000+ sessions exist, when I scroll through the list, then the frame rate MUST stay above 55 FPS |

**Data Requirements:**
- Source: `sessions/YYYY-MM/YYYY-MM-DD-slug.md` files
- Parse YAML frontmatter for: `id`, `slug`, `title`, `agent`, `model`, `createdAt`, `tokens.total`, `cost`, `status`, `tags`, `duration`
- Support pagination: 50 sessions per page, OR virtual scrolling

**UI Requirements:**
- Table or card list layout
- Columns: Date | Title | Agent | Tokens | Cost | Status | Duration
- Filter bar above list with: agent dropdown, status dropdown, date range picker, tag multi-select
- Sort headers on each column
- Pagination controls OR infinite scroll with virtualization
- Click any row to navigate to Session Detail (F3)
- Empty state: "No sessions found" with option to clear filters

**Dependencies:**
- Node.js bridge server endpoint: `GET /api/sessions` (with query params for filter/sort/pagination)
- Node.js bridge server endpoint: `GET /api/sessions/meta` (for filter options: agents, tags, statuses)
- F1 (Directory Selection) must be complete

---

### F3: Session Detail View

**Priority:** P0 (Critical — core feature)

**Description:** Display the full content of a single session, including the conversation timeline (user messages, assistant responses, tool calls), rendered as formatted markdown.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F3-1 | As a user, I want to read the full conversation of a session so that I can review what was discussed | Given I click a session in the list, when the detail view loads, then I MUST see the complete markdown body rendered as HTML |
| US-F3-2 | As a user, I want to see session metadata at the top so that I have context about the conversation | Given a session detail view, then I MUST display: title, agent, model, date, duration, tokens, cost, status, tags |
| US-F3-3 | As a user, I want code blocks to be syntax-highlighted so that I can read code easily | Given a session contains code blocks, when rendered, then code blocks MUST have syntax highlighting based on language |
| US-F3-4 | As a user, I want to see tool invocations clearly distinguished so that I can understand what actions were taken | Given a session contains tool calls, when rendered, then tool sections MUST be visually distinct from regular conversation |
| US-F3-5 | As a user, I want to navigate between related sessions so that I can follow conversation threads | Given a session has `relatedSessions` or `parentSession`, then I MUST see links to those sessions |
| US-F3-6 | As a user, I want to copy session content so that I can reuse it elsewhere | Given a session detail view, then I MUST be able to select and copy text, and there MUST be a "Copy Raw Markdown" button |
| US-F3-7 | As a user, I want to see a table of contents for long sessions so that I can navigate quickly | Given a session has 5+ H2 headings, then I MUST display a sidebar TOC with anchor links |

**Data Requirements:**
- Source: Single session markdown file
- Parse full file: frontmatter + body
- Body MUST be rendered as markdown (using `marked` library, already in dependencies)
- Code blocks MUST be sanitized (using `dompurify`, already in dependencies)

**UI Requirements:**
- Header section with metadata badges
- Main content area with rendered markdown
- Optional sidebar TOC for long sessions
- "Related Sessions" section at bottom
- "Copy Raw Markdown" button in header
- Breadcrumb navigation: Sessions > {session title}
- Loading state: skeleton placeholder while file loads
- Error state: "Session not found" if file is missing

**Dependencies:**
- Node.js bridge server endpoint: `GET /api/sessions/:id`
- F2 (Session List View) must be complete
- `marked` library (already in `package.json`)
- `dompurify` library (already in `package.json`)

---

### F4: Agent Overview

**Priority:** P1 (Important)

**Description:** Display a grid of agent cards showing the full OMC team. Each card shows the agent's name, emoji, role, model, and key stats.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F4-1 | As a user, I want to see all agents in a grid so that I can understand my team at a glance | Given agent files exist, when I navigate to Agents, then I MUST see a card grid with one card per agent |
| US-F4-2 | As a user, I want each agent card to show key info so that I can quickly identify agents | Given an agent card, then it MUST display: emoji, name, number, role, model, tier badge, and session count |
| US-F4-3 | As a user, I want to filter agents by tier so that I can focus on core vs specialist agents | Given I select a tier filter, when the grid updates, then I MUST see only agents matching the selected tier |
| US-F4-4 | As a user, I want to click an agent card to see details so that I can learn more about an agent | Given I click an agent card, when I click, then I MUST navigate to the Agent Detail View (F5) |

**Data Requirements:**
- Source: `agents/{slug}.md` files
- Parse frontmatter for: `id`, `name`, `slug`, `emoji`, `number`, `type`, `tier`, `status`, `model`, `shortDescription`, `sessionsCount`

**UI Requirements:**
- Responsive card grid (3-4 columns on desktop)
- Card design: emoji (large), name, number badge, role text, model text, tier badge (colored), session count
- Filter bar: tier dropdown (core/specialist/utility), status dropdown
- Click-through to F5
- Empty state: "No agent definitions found"

**Dependencies:**
- Node.js bridge server endpoint: `GET /api/agents`
- F1 (Directory Selection) must be complete

---

### F5: Agent Detail View

**Priority:** P1 (Important)

**Description:** Display the complete definition of a single agent, including full description, capabilities, skills, permissions, relationships, and session history.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F5-1 | As a user, I want to read the full agent definition so that I understand what an agent does | Given I navigate to an agent detail, then I MUST see the rendered markdown body |
| US-F5-2 | As a user, I want to see an agent's skills so that I know what capabilities it has | Given an agent has `skills` in frontmatter, then I MUST display them as clickable tags linking to Skill Detail (F6) |
| US-F5-3 | As a user, I want to see which sessions used this agent so that I can review its work | Given an agent has been used in sessions, then I MUST show a list of recent sessions (up to 20) with links |
| US-F5-4 | As a user, I want to see an agent's relationships so that I understand the team structure | Given an agent has `coordinatesWith` or `delegatesTo`, then I MUST display linked agent cards |

**Data Requirements:**
- Source: `agents/{slug}.md` file
- Parse full frontmatter + body
- Cross-reference with sessions to find sessions using this agent

**UI Requirements:**
- Header: emoji, name, number, tier badge, status badge
- Metadata section: model, type, permissions
- Rendered markdown body
- Skills section: tag list
- Relationships section: linked agent cards
- Recent sessions section: compact list
- Breadcrumb: Agents > {agent name}

**Dependencies:**
- Node.js bridge server endpoint: `GET /api/agents/:slug`
- Node.js bridge server endpoint: `GET /api/sessions?agent=:slug&limit=20`
- F4 (Agent Overview) must be complete

---

### F6: Skills Browser

**Priority:** P1 (Important)

**Description:** List and display all skill definitions with filtering by category and status.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F6-1 | As a user, I want to see all skills in a list so that I can browse available capabilities | Given skill files exist, when I navigate to Skills, then I MUST see a list of all skills |
| US-F6-2 | As a user, I want to filter skills by category so that I can find skills for a specific purpose | Given I select a category filter, when the list updates, then I MUST see only skills matching that category |
| US-F6-3 | As a user, I want to see which agents can use each skill so that I understand skill applicability | Given a skill has `compatibleAgents`, then I MUST display agent names/emojis on the skill card |
| US-F6-4 | As a user, I want to click a skill to see its full definition so that I understand how it works | Given I click a skill, when I click, then I MUST navigate to a skill detail view |

**Data Requirements:**
- Source: `skills/{slug}.md` files
- Parse frontmatter for: `id`, `name`, `slug`, `emoji`, `category`, `status`, `scope`, `shortDescription`, `compatibleAgents`, `usageCount`

**UI Requirements:**
- List or card layout
- Each item shows: emoji, name, category badge, status badge, short description, compatible agents
- Filter bar: category dropdown, status dropdown
- Click-through to skill detail (inline expand or separate view)
- Skill detail: rendered markdown body, workflow steps, tools used, examples

**Dependencies:**
- Node.js bridge server endpoint: `GET /api/skills`
- Node.js bridge server endpoint: `GET /api/skills/:slug`
- F1 (Directory Selection) must be complete

---

### F7: Config Viewer

**Priority:** P2 (Nice-to-have)

**Description:** Display OMC configuration files in a readable format with syntax highlighting for JSON/JSONC.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F7-1 | As a user, I want to see all tracked config files so that I can review my OMC configuration | Given config files exist, when I navigate to Configs, then I MUST see a list of all configs |
| US-F7-2 | As a user, I want to view a config file's content so that I can see the actual configuration | Given I click a config, when the detail view loads, then I MUST see the config content with JSON syntax highlighting |
| US-F7-3 | As a user, I want to see when a config was last synced so that I know if it's up to date | Given a config has `lastSynced`, then I MUST display the last sync date |

**Data Requirements:**
- Source: `configs/{slug}.md` files
- Parse frontmatter for: `id`, `name`, `slug`, `type`, `scope`, `description`, `sourcePath`, `lastSynced`
- Extract JSON/JSONC content from markdown body code blocks

**UI Requirements:**
- List view: name, type badge, scope badge, last synced date
- Detail view: rendered description + syntax-highlighted JSON code block
- Key settings table (if available in frontmatter)
- Breadcrumb: Configs > {config name}

**Dependencies:**
- Node.js bridge server endpoint: `GET /api/configs`
- Node.js bridge server endpoint: `GET /api/configs/:slug`
- F1 (Directory Selection) must be complete

---

### F8: Topics/Blogs Viewer

**Priority:** P1 (Important)

**Description:** Browse knowledge articles organized by category. Support filtering by type, status, and tags.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F8-1 | As a user, I want to browse topics by category so that I can find knowledge articles on specific subjects | Given topic files exist, when I navigate to Topics, then I MUST see topics grouped by category |
| US-F8-2 | As a user, I want to filter topics by type so that I can find articles, tutorials, or research notes | Given I select a type filter, when the list updates, then I MUST see only topics matching that type |
| US-F8-3 | As a user, I want to see topic metadata so that I can assess relevance before reading | Given a topic in the list, then I MUST show: title, category, type, status, createdAt, readTime, tags |
| US-F8-4 | As a user, I want to click a topic to read it so that I can consume the full content | Given I click a topic, when I click, then I MUST navigate to the Topic Detail View (F9) |

**Data Requirements:**
- Source: `topics/{category}/{slug}.md` files
- Parse frontmatter for: `id`, `slug`, `title`, `type`, `category`, `status`, `summary`, `createdAt`, `readTime`, `tags`, `author`

**UI Requirements:**
- Category sidebar or tabs
- Topic list within selected category
- Each item: title, type badge, status badge, summary (truncated), date, read time
- Filter bar: type dropdown, status dropdown, tag multi-select
- Sort: date, title, read time
- Pagination or virtualization
- Empty state per category

**Dependencies:**
- Node.js bridge server endpoint: `GET /api/topics` (with query params)
- Node.js bridge server endpoint: `GET /api/topics/categories` (list of categories)
- F1 (Directory Selection) must be complete

---

### F9: Topic Detail View

**Priority:** P1 (Important)

**Description:** Display the full content of a single topic/article with markdown rendering, related content links, and metadata.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F9-1 | As a user, I want to read a full topic article so that I can consume the knowledge | Given I navigate to a topic detail, then I MUST see the rendered markdown body |
| US-F9-2 | As a user, I want to see topic metadata so that I have context about the article | Given a topic detail view, then I MUST display: title, category, type, author, date, read time, tags |
| US-F9-3 | As a user, I want to see related topics so that I can discover connected knowledge | Given a topic has `relatedTopics`, then I MUST display links to those topics |
| US-F9-4 | As a user, I want to see the source session (if any) so that I can trace knowledge origin | Given a topic has `sourceSession`, then I MUST display a link to that session |

**Data Requirements:**
- Source: Single topic markdown file
- Parse full frontmatter + body
- Cross-reference with related topics and source session

**UI Requirements:**
- Header: title, metadata badges (category, type, status, author, date, read time)
- Tags section
- Rendered markdown body
- Related topics section
- Source session link (if applicable)
- References section (if available)
- Breadcrumb: Topics > {category} > {title}
- Table of contents for long articles (5+ H2 headings)

**Dependencies:**
- Node.js bridge server endpoint: `GET /api/topics/:slug`
- F8 (Topics Viewer) must be complete

---

### F10: Stats Dashboard

**Priority:** P1 (Important)

**Description:** Display aggregated statistics about OMC usage: token consumption, costs, agent activity, session trends over time.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F10-1 | As a user, I want to see total token usage so that I understand my API consumption | Given sessions exist, when I view the Stats page, then I MUST see: total input tokens, total output tokens, total reasoning tokens, grand total |
| US-F10-2 | As a user, I want to see total cost so that I can track my spending | Given sessions exist, when I view the Stats page, then I MUST see: total cost in USD, average cost per session, cost trend over time |
| US-F10-3 | As a user, I want to see agent activity breakdown so that I know which agents I use most | Given sessions exist, when I view the Stats page, then I MUST see a chart/table of sessions per agent, tokens per agent, cost per agent |
| US-F10-4 | As a user, I want to see session trends over time so that I can understand my usage patterns | Given sessions exist, when I view the Stats page, then I MUST see a line chart of sessions per day/week/month |
| US-F10-5 | As a user, I want to see content type counts so that I know the size of my knowledge base | Given content exists, when I view the Stats page, then I MUST see counts for: sessions, agents, skills, topics, configs |

**Data Requirements:**
- Source: All session frontmatter for aggregation
- Computed metrics:
  - Total tokens (sum of `tokens.total` across all sessions)
  - Total cost (sum of `cost` across all sessions)
  - Sessions per agent (group by `agent` field)
  - Sessions per day/week/month (group by `createdAt`)
  - Average session duration
  - Most used tags (top 10)

**UI Requirements:**
- Summary cards at top: Total Sessions | Total Tokens | Total Cost | Avg Cost/Session
- Charts (use a lightweight chart library, e.g., Recharts or Chart.js):
  - Line chart: Sessions over time (daily/weekly/monthly toggle)
  - Bar chart: Tokens by agent
  - Pie/donut chart: Cost distribution by agent
  - Horizontal bar: Top 10 tags
- Content type count cards
- Time range selector: 7 days | 30 days | 90 days | All time

**Dependencies:**
- Node.js bridge server endpoint: `GET /api/stats/summary`
- Node.js bridge server endpoint: `GET /api/stats/timeline`
- Node.js bridge server endpoint: `GET /api/stats/by-agent`
- Node.js bridge server endpoint: `GET /api/stats/top-tags`
- Chart library (MAY add Recharts or similar)
- F2 (Session List) must be complete (for data source)

---

### F11: Search & Filter

**Priority:** P0 (Critical — essential for usability)

**Description:** Global search across all content types (sessions, agents, skills, topics, configs) with weighted relevance scoring. Support combined filters.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F11-1 | As a user, I want to search across all content so that I can find anything quickly | Given I type in the search bar, when results appear, then I MUST see matches from sessions, agents, skills, topics, and configs |
| US-F11-2 | As a user, I want search results ranked by relevance so that the best matches appear first | Given multiple results, when displayed, then results MUST be sorted by weighted relevance score |
| US-F11-3 | As a user, I want to filter search results by content type so that I can narrow down results | Given search results exist, when I select a content type filter, then I MUST see only results of that type |
| US-F11-4 | As a user, I want to see search highlights so that I can quickly see why a result matched | Given a search result, then the matching text MUST be highlighted in the preview |
| US-F11-5 | As a user, I want search to be fast so that I don't wait for results | Given I type a search query, when results appear, then the response time MUST be under 200ms for up to 1000 files |

**Data Requirements:**
- Search index built from all content types
- Weighted fields (per Knowledge Architecture Section 9.3):
  - `title`: 10x weight
  - `tags`: 8x weight
  - `summary`/`excerpt`: 5x weight
  - `agent`/`model`: 3x weight
  - Body content: 1x weight
  - Tool names: 2x weight
- Use Fuse.js (already in `package.json`) for fuzzy search

**UI Requirements:**
- Global search bar in top navigation (always visible)
- Keyboard shortcut: `Cmd+K` / `Ctrl+K` to focus search
- Search results dropdown/panel showing:
  - Content type badge
  - Title (with highlights)
  - Preview snippet (with highlights)
  - Date
- Content type filter tabs above results
- "No results" state with suggestions
- Recent searches (stored in localStorage, max 10)

**Dependencies:**
- Node.js bridge server endpoint: `POST /api/search` (with query and optional type filter)
- Node.js bridge server endpoint: `GET /api/search/index` (build/rebuild search index)
- `fuse.js` library (already in `package.json`)
- All content-type endpoints (F2-F9) must be complete

---

### F12: Migration Tool

**Priority:** P0 (Critical — unblocks session visualization)

**Description:** One-time tool to migrate 321 existing SQLite sessions to markdown files following the Knowledge Architecture schema.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F12-1 | As a user, I want to migrate my existing SQLite sessions to markdown so that the dashboard can display them | Given the SQLite database exists, when I run the migration, then I MUST see 321 markdown files created in the correct directory structure |
| US-F12-2 | As a user, I want to see migration progress so that I know it's working | Given migration is running, when I watch the UI, then I MUST see a progress bar with count (e.g., "145/321 sessions migrated") |
| US-F12-3 | As a user, I want to validate migration results so that I know no data was lost | Given migration completes, when I view the report, then I MUST see: total migrated, total failed, any errors, and a sample of migrated files |
| US-F12-4 | As a user, I want to run a dry run first so that I can verify the output before committing | Given I select dry-run mode, when migration runs, then files MUST be written to a temporary directory and a preview report shown |
| US-F12-5 | As a user, I want the migration to preserve all data so that nothing is lost | Given a session in SQLite, when migrated, then the markdown file MUST contain: all messages, all tool calls, all token counts, all costs, all tags, and correct timestamps |

**Data Requirements:**
- Source: SQLite database at `~/.local/share/opencode/opencode.db`
- Tables to read: `sessions`, `messages`, `tools`, `tokens`, `costs`, `tags`
- Output: Markdown files at `sessions/YYYY-MM/YYYY-MM-DD-slug.md`
- Schema mapping per Knowledge Architecture Section 4.4

**UI Requirements:**
- Migration page accessible from sidebar or settings
- Step-by-step wizard:
  1. Select SQLite database path (auto-detected)
  2. Select output data root
  3. Choose dry-run or full migration
  4. Run migration with progress bar
  5. View validation report
- Progress indicators for each phase
- Error display for any failed migrations
- "View migrated files" button after completion

**Dependencies:**
- `better-sqlite3` or `sql.js` npm package (MUST be added)
- Node.js bridge server endpoint: `POST /api/migrate/start`
- Node.js bridge server endpoint: `GET /api/migrate/status`
- Node.js bridge server endpoint: `GET /api/migrate/report`
- Knowledge Architecture Section 4 (Migration Plan)

---

### F13: File Watcher

**Priority:** P1 (Important)

**Description:** Automatically detect changes to markdown files in the data root and refresh the UI without requiring a page reload.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F13-1 | As a user, I want the dashboard to update when files change so that I always see the latest data | Given a markdown file is modified on disk, when the change is detected, then the UI MUST refresh the affected view within 2 seconds |
| US-F13-2 | As a user, I want to know when new files are added so that I can see new sessions immediately | Given a new session file is created, when the file watcher detects it, then the session list MUST update to include the new session |
| US-F13-3 | As a user, I want to know when files are deleted so that I don't see stale content | Given a file is deleted from the data root, when the file watcher detects it, then the UI MUST remove the item from the relevant list |

**Data Requirements:**
- Watch all `.md` files within the data root recursively
- Debounce file change events (500ms) to handle bulk operations
- Track file events: `add`, `change`, `unlink`

**UI Requirements:**
- Subtle notification toast when files change: "3 files updated — refreshing..."
- Auto-refresh of current view
- Manual "Refresh" button in sidebar as fallback
- File watcher status indicator in status bar (green = watching, red = error)

**Dependencies:**
- Node.js bridge server: `chokidar` library for file watching
- WebSocket or Server-Sent Events for real-time notifications
- Node.js bridge server endpoint: WebSocket connection at `/ws/files`

---

### F14: Navigation & Routing

**Priority:** P0 (Critical — foundational)

**Description:** Multi-page navigation with sidebar, URL-based routing, breadcrumbs, and keyboard shortcuts.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-F14-1 | As a user, I want a sidebar navigation so that I can switch between sections | Given the app is loaded, then I MUST see a sidebar with links to: Sessions, Agents, Skills, Topics, Configs, Stats |
| US-F14-2 | As a user, I want URL-based routing so that I can bookmark and share specific views | Given I navigate to a view, when I look at the URL, then it MUST reflect the current page (e.g., `/sessions`, `/agents/orchestrator`) |
| US-F14-3 | As a user, I want breadcrumbs so that I know where I am in the navigation hierarchy | Given I am on a detail page, then I MUST see breadcrumbs showing the path (e.g., Sessions > 2025-04-12-eager-moon) |
| US-F14-4 | As a user, I want keyboard shortcuts so that I can navigate efficiently | Given I press keyboard shortcuts, then I MUST be able to: `G S` → Sessions, `G A` → Agents, `G T` → Topics, `G K` → Skills, `G C` → Configs, `G D` → Stats, `/` → Focus search |
| US-F14-5 | As a user, I want the sidebar to be collapsible so that I can maximize content area | Given I click the collapse button, when the sidebar collapses, then the content area MUST expand to fill the space |
| US-F14-6 | As a user, I want browser back/forward to work so that I can navigate history | Given I navigate between pages, when I press browser back, then I MUST return to the previous page |

**Data Requirements:**
- Route definitions:
  - `/` — Dashboard home (redirects to Sessions or shows setup)
  - `/setup` — Directory selection (F1)
  - `/sessions` — Session list (F2)
  - `/sessions/:id` — Session detail (F3)
  - `/agents` — Agent overview (F4)
  - `/agents/:slug` — Agent detail (F5)
  - `/skills` — Skills browser (F6)
  - `/skills/:slug` — Skill detail
  - `/topics` — Topics browser (F8)
  - `/topics/:category/:slug` — Topic detail (F9)
  - `/configs` — Config viewer (F7)
  - `/configs/:slug` — Config detail
  - `/stats` — Stats dashboard (F10)
  - `/migration` — Migration tool (F12)

**UI Requirements:**
- Sidebar component with:
  - App logo/title
  - Navigation links with icons
  - Collapsible sections
  - Settings link
  - Data root indicator
- Top bar with:
  - Sidebar toggle
  - Global search bar
  - Refresh button
- Breadcrumb component below top bar
- Main content area
- Status bar at bottom with: version, file count, watcher status

**Dependencies:**
- `react-router-dom` (already in `package.json`)
- All feature pages (F1-F13)

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [☰]  🧠 OMC Dashboard          [🔍 Search...]  [↻]  [⚙]      │ ← Top Bar (48px)
├──────────┬──────────────────────────────────────────────────────┤
│          │  Breadcrumbs: Sessions > 2025-04-12-eager-moon       │
│  Sidebar │  ─────────────────────────────────────────────────── │
│          │                                                       │
│  📋 Sessions                                                    │
│  👥 Agents                     ┌─────────────────────────────┐  │
│  🛠 Skills                      │                             │  │
│  📚 Topics                      │      Main Content Area      │  │
│  ⚙️ Configs                     │                             │  │
│  📊 Stats                       │                             │  │
│  🔄 Migration                   │                             │  │
│          │                      │                             │  │
│  ─────── │                      │                             │  │
│  📁 ~/second-brain             │                             │  │
│  🟢 Watching                   └─────────────────────────────┘  │
│          │                                                       │
├──────────┴──────────────────────────────────────────────────────┤
│  OMC Dashboard v0.2.0    |    321 sessions    |    🟢 Watching  │ ← Status Bar (24px)
└─────────────────────────────────────────────────────────────────┘
```

#### 4.1.2 Design System

| Element | Specification |
|---------|--------------|
| **Color Palette** | Dark theme primary. Background: `#0d1117`, Surface: `#161b22`, Border: `#30363d`, Text: `#e6edf3`, Accent: `#58a6ff` (blue), Success: `#3fb950`, Warning: `#d29922`, Error: `#f85149` |
| **Typography** | System font stack for body (`-apple-system, BlinkMacSystemFont, 'Segoe UI'`), monospace for code (`'SF Mono', 'Fira Code', 'Cascadia Code'`) |
| **Spacing** | 4px base unit. Components use multiples: 4, 8, 12, 16, 24, 32, 48 |
| **Border Radius** | 6px for cards, 4px for buttons, 8px for modals |
| **Shadows** | Subtle: `0 1px 3px rgba(0,0,0,0.3)`, Modal: `0 8px 24px rgba(0,0,0,0.5)` |
| **Transitions** | 150ms ease for hover, 200ms ease for sidebar collapse |
| **Icons** | Unicode emoji for agents, simple SVG icons for navigation |

#### 4.1.3 Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Desktop | ≥ 1280px | Full sidebar, multi-column layouts |
| Tablet | 768px – 1279px | Collapsible sidebar, single-column content |
| Mobile | < 768px | Overlay sidebar, stacked layout (MAY be deferred) |

### 4.2 Hardware Interfaces

| Interface | Description |
|-----------|-------------|
| **File System Read** | Node.js `fs` module reads `.md` files from the data root directory |
| **File System Watch** | `chokidar` library monitors file changes via OS-level file system events (FSEvents on macOS, inotify on Linux, ReadDirectoryChangesW on Windows) |
| **Disk I/O** | Migration tool writes `.md` files to the data root during one-time migration |

### 4.3 Software Interfaces

| Interface | Description |
|-----------|-------------|
| **Node.js Bridge Server** | Express.js server running on `localhost:3001` (configurable). Serves the React app (static files) and provides REST API endpoints |
| **opencode CLI** | External tool that creates/modifies markdown files. The dashboard reads files created by opencode |
| **SQLite Database** | Source for migration only. Read via `better-sqlite3` or `sql.js`. Not used after migration |
| **Browser localStorage** | Stores user preferences: data root path, sidebar state, theme, recent searches |

### 4.4 Communications Interfaces

| Protocol | Purpose | Details |
|----------|---------|---------|
| **HTTP/REST** | API communication between React app and Node.js server | JSON request/response, standard HTTP methods |
| **WebSocket** | Real-time file change notifications | Server pushes file events to connected clients |
| **Static File Serving** | Serve the built React app | Express `static()` middleware serving `dist/` directory |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-P1 | Initial page load (first paint) | < 1.5 seconds | Lighthouse Performance score |
| NFR-P2 | Time to interactive | < 3 seconds | Lighthouse TTI metric |
| NFR-P3 | Session list render (321 items) | < 500ms | React DevTools Profiler |
| NFR-P4 | Session list render (1000+ items) | < 1 second with virtualization | React DevTools Profiler |
| NFR-P5 | Search response time (1000 files) | < 200ms | `performance.now()` timing |
| NFR-P6 | Markdown file parse time (single file) | < 50ms | Server-side timing |
| NFR-P7 | Markdown file parse time (bulk, 321 files) | < 5 seconds | Server-side timing |
| NFR-P8 | File change detection latency | < 500ms | Time from file save to UI update |
| NFR-P9 | Stats dashboard aggregation (321 sessions) | < 1 second | Server-side timing |
| NFR-P10 | Frame rate during scrolling | ≥ 55 FPS | Chrome DevTools Performance tab |

### 5.2 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-S1 | Maximum sessions supported | 10,000+ (with virtualization) |
| NFR-S2 | Maximum markdown files in data root | 50,000+ |
| NFR-S3 | Maximum tags in index | 1,000+ |
| NFR-S4 | Maximum file size (single markdown) | 10 MB |
| NFR-S5 | Maximum data root size | 5 GB |
| NFR-S6 | Concurrent WebSocket connections | 1 (single user) |

### 5.3 Security

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-SEC1 | Local-only access | The Node.js server MUST bind to `127.0.0.1` only, NOT `0.0.0.0` |
| NFR-SEC2 | No external data transmission | The app MUST NOT send any data to external servers (no analytics, no telemetry) |
| NFR-SEC3 | Path traversal prevention | API endpoints MUST validate that requested file paths are within the configured data root |
| NFR-SEC4 | Input sanitization | All markdown content MUST be sanitized before rendering (use `dompurify`) |
| NFR-SEC5 | No code execution | Markdown rendering MUST NOT execute JavaScript embedded in markdown |
| NFR-SEC6 | CORS restricted | If CORS is enabled, it MUST only allow `localhost` origins |

### 5.4 Reliability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-R1 | Graceful degradation | If the Node.js server is unavailable, the app MUST show a clear error message with retry option |
| NFR-R2 | Missing file handling | If a referenced markdown file is missing, the app MUST show "File not found" with navigation back |
| NFR-R3 | Invalid frontmatter handling | If a file has invalid YAML frontmatter, the app MUST show a warning and display the raw content |
| NFR-R4 | Auto-reconnect | If the WebSocket connection drops, the app MUST attempt to reconnect every 5 seconds (max 10 attempts) |
| NFR-R5 | Data root validation | If the data root becomes inaccessible, the app MUST show a setup screen to re-select |

### 5.5 Usability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-U1 | Intuitive navigation | A new user MUST be able to find sessions, agents, and topics within 30 seconds without documentation |
| NFR-U2 | Keyboard accessibility | All interactive elements MUST be reachable via keyboard (Tab, Enter, Escape) |
| NFR-U3 | Search accessibility | Global search MUST be reachable via `Cmd+K` / `Ctrl+K` from any page |
| NFR-U4 | Loading states | All async operations MUST show loading indicators (skeleton screens or spinners) |
| NFR-U5 | Error messages | All errors MUST be displayed in user-friendly language with actionable suggestions |
| NFR-U6 | Consistent design | All pages MUST follow the same design system (colors, spacing, typography) |

### 5.6 Maintainability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-M1 | Code organization | Source code MUST follow a feature-based folder structure (see Implementation Plan) |
| NFR-M2 | TypeScript strict mode | The project MUST use TypeScript strict mode (`"strict": true` in `tsconfig.json`) |
| NFR-M3 | Component documentation | All reusable components MUST have JSDoc comments describing props and behavior |
| NFR-M4 | API documentation | All API endpoints MUST be documented with request/response examples |
| NFR-M5 | Error logging | Server-side errors MUST be logged to console with stack traces in development |

---

## 6. Data Requirements

### 6.1 Markdown File Format Specifications

All content files MUST follow this structure:

```markdown
---
# YAML frontmatter
key: value
---

# Markdown body
Content here...
```

**Rules:**
- Frontmatter MUST be delimited by `---` on the first and last lines
- Frontmatter MUST be valid YAML
- Body MUST be valid Markdown (CommonMark compliant)
- Files MUST use UTF-8 encoding
- Files MUST use Unix line endings (`\n`)

### 6.2 Frontmatter Schema for Each Content Type

Refer to the Knowledge Architecture document (Section 2) for complete schemas. Summary:

#### Session Frontmatter (Required Fields)

| Field | Type | Example | Validation |
|-------|------|---------|------------|
| `id` | string | `ses_abc123` | Pattern: `^ses_[a-zA-Z0-9]+$` |
| `slug` | string | `eager-moon` | Pattern: `^[a-z0-9]+(-[a-z0-9]+)*$` |
| `title` | string | `Research ai-devkit.com` | Non-empty, max 200 chars |
| `agent` | string | `researcher` | Non-empty |
| `model` | string | `kimi-k2.5` | Non-empty |
| `createdAt` | string | `2025-04-12T10:30:00Z` | ISO 8601 UTC |
| `updatedAt` | string | `2025-04-12T10:35:00Z` | ISO 8601 UTC |
| `tokens` | object | `{input: 1234, output: 567, total: 1890}` | All fields non-negative integers |
| `cost` | number | `0.00234` | Non-negative |
| `status` | string | `completed` | Enum: `active`, `completed`, `failed`, `abandoned` |
| `version` | integer | `1` | Minimum: 1 |

#### Agent Frontmatter (Required Fields)

| Field | Type | Example | Validation |
|-------|------|---------|------------|
| `id` | string | `agent_orchestrator` | Pattern: `^agent_[a-zA-Z0-9_]+$` |
| `name` | string | `Orchestrator` | Non-empty |
| `slug` | string | `orchestrator` | Pattern: `^[a-z0-9]+(-[a-z0-9]+)*$` |
| `type` | string | `coordinator` | Enum: `coordinator`, `specialist`, `executor` |
| `tier` | string | `core` | Enum: `core`, `specialist`, `utility` |
| `status` | string | `active` | Enum: `active`, `deprecated`, `experimental` |
| `whenToUse` | string | `Use when planning complex tasks...` | Non-empty |
| `version` | integer | `1` | Minimum: 1 |

#### Skill Frontmatter (Required Fields)

| Field | Type | Example | Validation |
|-------|------|---------|------------|
| `id` | string | `skill_docs` | Pattern: `^skill_[a-zA-Z0-9_]+$` |
| `name` | string | `docs` | Non-empty |
| `slug` | string | `docs` | Pattern: `^[a-z0-9]+(-[a-z0-9]+)*$` |
| `category` | string | `documentation` | Enum: see Knowledge Architecture Section 5.1 |
| `status` | string | `active` | Enum: `active`, `deprecated`, `experimental` |
| `whenToUse` | string | `Use when generating README files...` | Non-empty |
| `version` | integer | `1` | Minimum: 1 |

#### Topic Frontmatter (Required Fields)

| Field | Type | Example | Validation |
|-------|------|---------|------------|
| `id` | string | `topic_ai_tools_2025` | Pattern: `^topic_[a-zA-Z0-9_]+$` |
| `slug` | string | `ai-tools-landscape-2025` | Pattern: `^[a-z0-9]+(-[a-z0-9]+)*$` |
| `title` | string | `AI Development Tools Landscape 2025` | Non-empty, max 200 chars |
| `type` | string | `article` | Enum: `article`, `blog`, `research-note`, `tutorial`, `reference`, `meeting-note`, `idea` |
| `category` | string | `technology` | Non-empty |
| `status` | string | `published` | Enum: `draft`, `published`, `archived` |
| `createdAt` | string | `2025-04-12T10:30:00Z` | ISO 8601 UTC |
| `version` | integer | `1` | Minimum: 1 |

#### Config Frontmatter (Required Fields)

| Field | Type | Example | Validation |
|-------|------|---------|------------|
| `id` | string | `config_opencode_main` | Pattern: `^config_[a-zA-Z0-9_]+$` |
| `name` | string | `opencode.jsonc` | Non-empty |
| `slug` | string | `opencode-main` | Pattern: `^[a-z0-9]+(-[a-z0-9]+)*$` |
| `type` | string | `opencode` | Enum: `opencode`, `skill`, `agent`, `theme`, `environment` |
| `scope` | string | `global` | Enum: `global`, `project`, `user` |
| `sourcePath` | string | `~/.config/opencode/opencode.jsonc` | Non-empty |
| `lastSynced` | string | `2025-04-12T10:00:00Z` | ISO 8601 UTC |
| `version` | integer | `1` | Minimum: 1 |

### 6.3 File Naming Conventions

| Content Type | Pattern | Example |
|--------------|---------|---------|
| Session | `sessions/YYYY-MM/YYYY-MM-DD-slug.md` | `sessions/2025-04/2025-04-12-eager-moon.md` |
| Agent | `agents/{slug}.md` | `agents/orchestrator.md` |
| Skill | `skills/{slug}.md` | `skills/docs.md` |
| Topic | `topics/{category}/{slug}.md` | `topics/technology/ai-tools-2025.md` |
| Config | `configs/{slug}.md` | `configs/opencode-main.md` |

### 6.4 Directory Structure

```
{data-root}/
├── sessions/
│   └── YYYY-MM/
│       └── YYYY-MM-DD-slug.md
├── agents/
│   └── {slug}.md
├── skills/
│   └── {slug}.md
├── topics/
│   └── {category}/
│       └── {slug}.md
├── configs/
│   └── {slug}.md
├── assets/                    ← MAY exist, not required for MVP
├── .second-brain/             ← Auto-generated metadata, MAY exist
└── README.md                  ← Optional overview file
```

### 6.5 Data Validation Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| VR-1 | All markdown files MUST have valid YAML frontmatter | Server-side parsing, reject invalid files with warning |
| VR-2 | `id` fields MUST be unique within their content type | Server-side index building, log duplicates |
| VR-3 | `slug` fields MUST be unique within their content type | Server-side index building, log duplicates |
| VR-4 | Date fields MUST be valid ISO 8601 UTC | Parse with `new Date()`, reject invalid |
| VR-5 | `tokens.total` MUST equal `tokens.input + tokens.output + tokens.reasoning` | Server-side validation, log mismatches |
| VR-6 | `cost` MUST be non-negative | Server-side validation, clamp to 0 if negative |
| VR-7 | Enum fields MUST match allowed values | Server-side validation, default to first enum value if invalid |
| VR-8 | File paths MUST be within the configured data root | Path traversal check on every API request |

---

## 7. API Specification

### 7.1 Server Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| Host | `127.0.0.1` | Localhost only (NFR-SEC1) |
| Port | `3001` | Configurable via `PORT` env var |
| CORS | Disabled | Not needed for same-origin |
| Body limit | `10mb` | For migration uploads |
| Static files | `dist/` | React app build output |

### 7.2 REST API Endpoints

#### Configuration

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/config/data-root` | Get current data root | — | `{ "path": "/Users/.../second-brain" }` |
| `POST` | `/api/config/data-root` | Set data root | `{ "path": "/path/to/root" }` | `{ "success": true, "path": "..." }` |
| `POST` | `/api/config/validate-root` | Validate a path | `{ "path": "/path/to/check" }` | `{ "valid": true, "contentTypes": ["sessions", "agents"] }` |

#### Sessions

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/sessions` | List sessions with filtering | Query params: `page`, `limit`, `agent`, `status`, `tags`, `dateFrom`, `dateTo`, `sort`, `order` | `{ "sessions": [...], "total": 321, "page": 1, "limit": 50 }` |
| `GET` | `/api/sessions/meta` | Get filter options | — | `{ "agents": [...], "statuses": [...], "tags": [...], "dateRange": { "min": "...", "max": "..." } }` |
| `GET` | `/api/sessions/:id` | Get single session | — | `{ "frontmatter": {...}, "body": "...", "raw": "..." }` |

#### Agents

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/agents` | List all agents | Query params: `tier`, `status` | `{ "agents": [...] }` |
| `GET` | `/api/agents/:slug` | Get single agent | — | `{ "frontmatter": {...}, "body": "..." }` |

#### Skills

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/skills` | List all skills | Query params: `category`, `status` | `{ "skills": [...] }` |
| `GET` | `/api/skills/:slug` | Get single skill | — | `{ "frontmatter": {...}, "body": "..." }` |

#### Topics

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/topics` | List topics with filtering | Query params: `category`, `type`, `status`, `tags`, `page`, `limit`, `sort`, `order` | `{ "topics": [...], "total": N, "page": 1, "limit": 50 }` |
| `GET` | `/api/topics/categories` | List topic categories | — | `{ "categories": [{ "slug": "technology", "count": 12 }, ...] }` |
| `GET` | `/api/topics/:slug` | Get single topic | — | `{ "frontmatter": {...}, "body": "..." }` |

#### Configs

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/configs` | List all configs | — | `{ "configs": [...] }` |
| `GET` | `/api/configs/:slug` | Get single config | — | `{ "frontmatter": {...}, "body": "..." }` |

#### Stats

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/stats/summary` | Get summary statistics | — | `{ "totalSessions": 321, "totalTokens": {...}, "totalCost": 0.45, "avgCostPerSession": 0.0014, "contentCounts": {...} }` |
| `GET` | `/api/stats/timeline` | Get timeline data | Query params: `granularity` (day/week/month), `range` (7d/30d/90d/all) | `{ "data": [{ "date": "...", "sessions": 5, "tokens": 12345, "cost": 0.01 }, ...] }` |
| `GET` | `/api/stats/by-agent` | Get per-agent statistics | — | `{ "agents": [{ "slug": "researcher", "sessions": 89, "tokens": 2500000, "cost": 0.045 }, ...] }` |
| `GET` | `/api/stats/top-tags` | Get most used tags | Query params: `limit` (default 10) | `{ "tags": [{ "name": "research", "count": 45 }, ...] }` |

#### Search

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `POST` | `/api/search` | Search across all content | `{ "query": "search term", "type": "session", "limit": 20 }` | `{ "results": [{ "type": "session", "id": "...", "title": "...", "preview": "...", "score": 0.95 }, ...] }` |
| `GET` | `/api/search/index` | Get search index status | — | `{ "indexed": 321, "lastBuilt": "2025-04-12T10:00:00Z" }` |

#### Migration

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `POST` | `/api/migrate/start` | Start migration | `{ "sqlitePath": "...", "outputRoot": "...", "dryRun": false }` | `{ "migrationId": "mig_abc123", "status": "running" }` |
| `GET` | `/api/migrate/status` | Get migration progress | — | `{ "migrationId": "mig_abc123", "status": "running", "progress": 145, "total": 321 }` |
| `GET` | `/api/migrate/report` | Get migration report | — | `{ "status": "completed", "migrated": 321, "failed": 0, "errors": [], "duration": "45s" }` |

### 7.3 Response Format

All API responses MUST follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-04-12T10:00:00Z"
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "Session file not found: ses_abc123",
    "details": { "path": "sessions/2025-04/2025-04-12-eager-moon.md" }
  }
}
```

### 7.4 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `DATA_ROOT_NOT_SET` | 400 | No data root has been configured |
| `DATA_ROOT_INVALID` | 400 | The configured data root path is invalid or inaccessible |
| `FILE_NOT_FOUND` | 404 | The requested file does not exist |
| `INVALID_FRONTMATTER` | 422 | The file has invalid YAML frontmatter |
| `PATH_TRAVERSAL` | 403 | The requested path is outside the data root |
| `MIGRATION_IN_PROGRESS` | 409 | A migration is already running |
| `SQLITE_NOT_FOUND` | 404 | The SQLite database file was not found |
| `INTERNAL_ERROR` | 500 | An unexpected server error occurred |

### 7.5 WebSocket Interface

**Endpoint:** `ws://127.0.0.1:3001/ws/files`

**Server → Client Messages:**

```json
{
  "type": "file_change",
  "event": "add" | "change" | "unlink",
  "path": "sessions/2025-04/2025-04-12-new-session.md",
  "contentType": "session",
  "timestamp": "2025-04-12T10:00:00Z"
}
```

```json
{
  "type": "index_rebuilt",
  "contentType": "sessions",
  "count": 322,
  "timestamp": "2025-04-12T10:00:00Z"
}
```

**Client → Server Messages:**

```json
{
  "type": "subscribe",
  "contentTypes": ["sessions", "agents", "topics"]
}
```

```json
{
  "type": "unsubscribe"
}
```

---

## 8. Implementation Plan

### 8.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 19.x | UI components |
| **Language** | TypeScript | 6.x | Type safety |
| **Build Tool** | Vite | 8.x | Fast builds, dev server |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Routing** | React Router | 7.x | Client-side routing |
| **State Management** | Zustand | 5.x | Lightweight state |
| **Markdown Parsing** | marked | 18.x | Markdown to HTML |
| **HTML Sanitization** | DOMPurify | 3.x | XSS prevention |
| **Search** | Fuse.js | 7.x | Fuzzy search |
| **Date Formatting** | date-fns | 4.x | Date manipulation |
| **Virtualization** | @tanstack/react-virtual | 3.x | Large list performance |
| **Backend** | Express.js | 4.x/5.x | REST API server |
| **File Watching** | chokidar | 3.x | File system monitoring |
| **YAML Parsing** | js-yaml | 4.x | Frontmatter parsing |
| **SQLite Reading** | better-sqlite3 | 11.x | Migration tool |
| **WebSocket** | ws | 8.x | Real-time notifications |

### 8.2 Project Structure

```
second-brain/
├── server/                          ← NEW: Node.js bridge server
│   ├── index.ts                     ← Server entry point
│   ├── config.ts                    ← Server configuration
│   ├── routes/
│   │   ├── config.ts                ← Config endpoints
│   │   ├── sessions.ts              ← Session endpoints
│   │   ├── agents.ts                ← Agent endpoints
│   │   ├── skills.ts                ← Skill endpoints
│   │   ├── topics.ts                ← Topic endpoints
│   │   ├── configs.ts               ← Config file endpoints
│   │   ├── stats.ts                 ← Stats endpoints
│   │   ├── search.ts                ← Search endpoints
│   │   └── migration.ts             ← Migration endpoints
│   ├── services/
│   │   ├── file-reader.ts           ← Markdown file reading
│   │   ├── frontmatter-parser.ts    ← YAML frontmatter parsing
│   │   ├── search-index.ts          ← Search index management
│   │   ├── file-watcher.ts          ← File system watching
│   │   ├── stats-aggregator.ts      ← Statistics computation
│   │   └── migration-engine.ts      ← SQLite → Markdown migration
│   ├── middleware/
│   │   ├── validate-root.ts         ← Data root validation
│   │   └── error-handler.ts         ← Global error handling
│   └── types/
│       └── index.ts                 ← Shared TypeScript types
│
├── src/                             ← EXISTING: React app (to be refactored)
│   ├── main.tsx                     ← Entry point (KEEP)
│   ├── index.css                    ← Global styles (UPDATE)
│   ├── vite-env.d.ts                ← Vite types (KEEP)
│   │
│   ├── routes/                      ← Page components
│   │   ├── App.tsx                  ← Root layout (REWRITE)
│   │   ├── SetupPage.tsx            ← F1: Directory selection
│   │   ├── SessionsPage.tsx         ← F2: Session list
│   │   ├── SessionDetailPage.tsx    ← F3: Session detail
│   │   ├── AgentsPage.tsx           ← F4: Agent overview
│   │   ├── AgentDetailPage.tsx      ← F5: Agent detail
│   │   ├── SkillsPage.tsx           ← F6: Skills browser
│   │   ├── SkillDetailPage.tsx      ← Skill detail
│   │   ├── TopicsPage.tsx           ← F8: Topics browser
│   │   ├── TopicDetailPage.tsx      ← F9: Topic detail
│   │   ├── ConfigsPage.tsx          ← F7: Config viewer
│   │   ├── ConfigDetailPage.tsx     ← Config detail
│   │   ├── StatsPage.tsx            ← F10: Stats dashboard
│   │   └── MigrationPage.tsx        ← F12: Migration tool
│   │
│   ├── components/                  ← Reusable components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          ← Navigation sidebar
│   │   │   ├── TopBar.tsx           ← Top navigation bar
│   │   │   ├── StatusBar.tsx        ← Bottom status bar
│   │   │   └── Breadcrumbs.tsx      ← Breadcrumb navigation
│   │   ├── shared/
│   │   │   ├── MarkdownRenderer.tsx ← Markdown → HTML component
│   │   │   ├── StatusBadge.tsx      ← Status indicator badge
│   │   │   ├── TagList.tsx          ← Tag display component
│   │   │   ├── EmptyState.tsx       ← Empty state component
│   │   │   ├── LoadingSkeleton.tsx  ← Loading placeholder
│   │   │   └── ErrorBoundary.tsx    ← Error boundary
│   │   ├── sessions/
│   │   │   ├── SessionList.tsx      ← Session list/table
│   │   │   ├── SessionCard.tsx      ← Session card component
│   │   │   ├── SessionFilters.tsx   ← Filter bar
│   │   │   └── SessionTOC.tsx       ← Table of contents
│   │   ├── agents/
│   │   │   ├── AgentGrid.tsx        ← Agent card grid
│   │   │   └── AgentCard.tsx        ← Agent card component
│   │   ├── skills/
│   │   │   ├── SkillList.tsx        ← Skill list
│   │   │   └── SkillCard.tsx        ← Skill card component
│   │   ├── topics/
│   │   │   ├── TopicList.tsx        ← Topic list
│   │   │   └── TopicCard.tsx        ← Topic card component
│   │   ├── search/
│   │   │   ├── SearchBar.tsx        ← Global search input
│   │   │   └── SearchResults.tsx    ← Search results dropdown
│   │   └── stats/
│   │       ├── StatCards.tsx        ← Summary stat cards
│   │       ├── TimelineChart.tsx    ← Time series chart
│   │       └── AgentChart.tsx       ← Agent breakdown chart
│   │
│   ├── hooks/                       ← Custom React hooks
│   │   ├── useApi.ts                ← API request hook
│   │   ├── useFileWatcher.ts        ← WebSocket file watcher hook
│   │   ├── useKeyboardShortcuts.ts  ← Keyboard shortcut hook (KEEP/UPDATE)
│   │   └── useDebounce.ts           ← Debounce hook
│   │
│   ├── state/                       ← Zustand stores
│   │   ├── app-store.ts             ← App state (data root, loading)
│   │   ├── filter-store.ts          ← Filter state
│   │   └── search-store.ts          ← Search state
│   │
│   ├── services/                    ← Client-side services
│   │   ├── api.ts                   ← API client (fetch wrapper)
│   │   └── websocket.ts             ← WebSocket client
│   │
│   ├── types/                       ← TypeScript types
│   │   ├── session.ts               ← Session type definitions
│   │   ├── agent.ts                 ← Agent type definitions
│   │   ├── skill.ts                 ← Skill type definitions
│   │   ├── topic.ts                 ← Topic type definitions
│   │   ├── config.ts                ← Config type definitions
│   │   ├── stats.ts                 ← Stats type definitions
│   │   ├── search.ts                ← Search type definitions
│   │   └── api.ts                   ← API response types
│   │
│   └── utils/                       ← Utility functions
│       ├── date.ts                  ← Date formatting
│       ├── tokens.ts                ← Token formatting
│       └── validation.ts            ← Frontmatter validation
│
├── scripts/
│   ├── migrate-sqlite-to-markdown.ts ← Migration script (standalone)
│   └── validate-frontmatter.ts       ← Validation script
│
├── docs/
│   └── specs/
│       ├── 2025-04-12-omc-knowledge-architecture.md  ← EXISTING
│       └── 2025-04-12-omc-dashboard-srs.md           ← THIS FILE
│
├── server/                          ← Server package.json
│   └── package.json
│
├── package.json                     ← Client package.json (UPDATE)
├── vite.config.ts                   ← Vite config (UPDATE)
├── tsconfig.json                    ← TypeScript config (UPDATE)
└── index.html                       ← HTML template (KEEP)
```

### 8.3 Phase 1: Foundation (Week 1-2)

**Goal:** Migration tool + basic session viewing

| Task | Files | Dependencies | Est. Time |
|------|-------|-------------|-----------|
| 1.1 Set up Node.js bridge server | `server/` directory, `server/package.json`, `server/index.ts` | — | 4 hours |
| 1.2 Implement file reader service | `server/services/file-reader.ts`, `server/services/frontmatter-parser.ts` | 1.1 | 4 hours |
| 1.3 Implement data root config endpoints | `server/routes/config.ts`, `server/middleware/validate-root.ts` | 1.1 | 2 hours |
| 1.4 Implement session API endpoints | `server/routes/sessions.ts` | 1.2, 1.3 | 4 hours |
| 1.5 Create TypeScript types for all content | `src/types/*.ts` | — | 3 hours |
| 1.6 Create API client service | `src/services/api.ts` | 1.5 | 2 hours |
| 1.7 Build Directory Selection UI (F1) | `src/routes/SetupPage.tsx`, `src/state/app-store.ts` | 1.3, 1.6 | 4 hours |
| 1.8 Build Migration Tool UI (F12) | `src/routes/MigrationPage.tsx`, `server/routes/migration.ts`, `server/services/migration-engine.ts` | 1.4, 1.7 | 8 hours |
| 1.9 Build Session List View (F2) | `src/routes/SessionsPage.tsx`, `src/components/sessions/*` | 1.4, 1.6 | 6 hours |
| 1.10 Build Session Detail View (F3) | `src/routes/SessionDetailPage.tsx`, `src/components/shared/MarkdownRenderer.tsx` | 1.4, 1.6 | 4 hours |
| 1.11 Set up routing and navigation shell (F14) | `src/routes/App.tsx`, `src/components/layout/*` | 1.7 | 4 hours |

**Phase 1 Deliverables:**
- [ ] Node.js server running on `localhost:3001`
- [ ] Data root selection working
- [ ] SQLite → Markdown migration complete (321 sessions)
- [ ] Session list viewable with basic filtering
- [ ] Session detail viewable with markdown rendering
- [ ] Basic navigation between pages

### 8.4 Phase 2: Agent & Config Visualization (Week 3)

**Goal:** Agent team, skills, and config viewing

| Task | Files | Dependencies | Est. Time |
|------|-------|-------------|-----------|
| 2.1 Implement agent API endpoints | `server/routes/agents.ts` | Phase 1 | 2 hours |
| 2.2 Implement skill API endpoints | `server/routes/skills.ts` | Phase 1 | 2 hours |
| 2.3 Implement config API endpoints | `server/routes/configs.ts` | Phase 1 | 2 hours |
| 2.4 Build Agent Overview (F4) | `src/routes/AgentsPage.tsx`, `src/components/agents/*` | 2.1 | 3 hours |
| 2.5 Build Agent Detail (F5) | `src/routes/AgentDetailPage.tsx` | 2.1, 2.4 | 3 hours |
| 2.6 Build Skills Browser (F6) | `src/routes/SkillsPage.tsx`, `src/components/skills/*` | 2.2 | 3 hours |
| 2.7 Build Config Viewer (F7) | `src/routes/ConfigsPage.tsx` | 2.3 | 2 hours |
| 2.8 Populate agent/skill/config data | Copy from `~/.config/opencode/` to data root | — | 2 hours |

**Phase 2 Deliverables:**
- [ ] Agent team grid viewable
- [ ] Agent detail pages with session history
- [ ] Skills browser with filtering
- [ ] Config viewer with syntax highlighting
- [ ] All data populated from existing OMC config

### 8.5 Phase 3: Topics & Stats Dashboard (Week 4)

**Goal:** Knowledge articles and analytics

| Task | Files | Dependencies | Est. Time |
|------|-------|-------------|-----------|
| 3.1 Implement topic API endpoints | `server/routes/topics.ts` | Phase 1 | 3 hours |
| 3.2 Implement stats API endpoints | `server/routes/stats.ts`, `server/services/stats-aggregator.ts` | Phase 1 | 4 hours |
| 3.3 Build Topics Browser (F8) | `src/routes/TopicsPage.tsx`, `src/components/topics/*` | 3.1 | 4 hours |
| 3.4 Build Topic Detail (F9) | `src/routes/TopicDetailPage.tsx` | 3.1 | 3 hours |
| 3.5 Build Stats Dashboard (F10) | `src/routes/StatsPage.tsx`, `src/components/stats/*` | 3.2 | 6 hours |
| 3.6 Add chart library | Add Recharts to `package.json` | — | 1 hour |

**Phase 3 Deliverables:**
- [ ] Topics browsable by category
- [ ] Topic detail with markdown rendering
- [ ] Stats dashboard with charts
- [ ] Token usage, cost, and agent activity analytics

### 8.6 Phase 4: Polish & Performance (Week 5)

**Goal:** Search, file watching, and refinement

| Task | Files | Dependencies | Est. Time |
|------|-------|-------------|-----------|
| 4.1 Implement search API | `server/routes/search.ts`, `server/services/search-index.ts` | Phase 1-3 | 6 hours |
| 4.2 Implement file watcher | `server/services/file-watcher.ts`, WebSocket endpoint | Phase 1 | 4 hours |
| 4.3 Build global search UI (F11) | `src/components/search/*`, `src/hooks/useFileWatcher.ts` | 4.1 | 4 hours |
| 4.4 Build file watcher UI (F13) | `src/hooks/useFileWatcher.ts`, status bar indicator | 4.2 | 2 hours |
| 4.5 Add keyboard shortcuts | `src/hooks/useKeyboardShortcuts.ts` (update) | Phase 1 | 2 hours |
| 4.6 Performance optimization | Virtualization, memoization, code splitting | All phases | 6 hours |
| 4.7 Error handling and edge cases | Error boundaries, empty states, loading states | All phases | 4 hours |
| 4.8 Testing | Unit tests, integration tests, E2E tests | All phases | 8 hours |

**Phase 4 Deliverables:**
- [ ] Global search across all content types
- [ ] Auto-refresh on file changes
- [ ] Keyboard navigation
- [ ] Performance targets met (NFR-P1 through NFR-P10)
- [ ] All error states handled gracefully
- [ ] Test coverage ≥ 70%

### 8.7 Timeline Summary

| Phase | Duration | Key Milestone |
|-------|----------|---------------|
| Phase 1: Foundation | Week 1-2 | Migration complete, sessions viewable |
| Phase 2: Agent & Config | Week 3 | Full team visualization |
| Phase 3: Topics & Stats | Week 4 | Knowledge articles + analytics |
| Phase 4: Polish & Performance | Week 5 | Search, file watching, production-ready |
| **Total** | **5 weeks** | **Fully functional dashboard** |

---

## 9. Testing Strategy

### 9.1 Unit Tests

| Component | What to Test | Tool | Target Coverage |
|-----------|-------------|------|-----------------|
| `frontmatter-parser.ts` | Valid YAML parsing, invalid YAML handling, missing required fields, enum validation | Vitest | ≥ 90% |
| `file-reader.ts` | File reading, path traversal prevention, missing file handling, encoding detection | Vitest | ≥ 90% |
| `search-index.ts` | Index building, weighted scoring, fuzzy matching, empty index | Vitest | ≥ 85% |
| `stats-aggregator.ts` | Token summation, cost calculation, date grouping, agent grouping | Vitest | ≥ 90% |
| `migration-engine.ts` | SQLite reading, markdown generation, schema mapping, dry-run mode | Vitest | ≥ 85% |
| `validation.ts` | Frontmatter validation rules, ID patterns, date parsing, enum checking | Vitest | ≥ 90% |
| `api.ts` (client) | Request building, error handling, response parsing | Vitest | ≥ 80% |

### 9.2 Integration Tests

| Component | What to Test | Tool | Target Coverage |
|-----------|-------------|------|-----------------|
| Server API endpoints | All REST endpoints with real markdown files | Vitest + supertest | ≥ 80% |
| File watcher | File add/change/delete events trigger WebSocket messages | Vitest + chokidar | ≥ 75% |
| Migration flow | End-to-end SQLite → Markdown migration on test database | Vitest | ≥ 80% |
| Search flow | Index building → search query → ranked results | Vitest | ≥ 75% |

### 9.3 E2E Tests

| Scenario | What to Test | Tool | Priority |
|----------|-------------|------|----------|
| Setup flow | Select data root → validate → save → redirect to sessions | Playwright | P0 |
| Session browsing | Navigate to sessions → filter by agent → sort by date → click session | Playwright | P0 |
| Session detail | View session → see metadata → read markdown → see code highlighting → navigate to related | Playwright | P0 |
| Agent browsing | Navigate to agents → filter by tier → click agent → see details → see session history | Playwright | P1 |
| Search | Open search → type query → see results → filter by type → click result | Playwright | P0 |
| Navigation | Use sidebar → use breadcrumbs → use keyboard shortcuts → use browser back/forward | Playwright | P1 |
| File watching | Modify a markdown file → see auto-refresh notification → see updated content | Playwright | P1 |
| Stats dashboard | Navigate to stats → see summary cards → see charts → change time range | Playwright | P2 |

### 9.4 Performance Tests

| Test | Method | Target |
|------|--------|--------|
| Initial load time | Lighthouse CI | < 1.5s first paint |
| Session list render (1000 items) | React DevTools Profiler | < 1s render time |
| Search response (1000 files) | `performance.now()` | < 200ms |
| Scroll frame rate | Chrome DevTools | ≥ 55 FPS |
| Memory usage | Chrome DevTools Memory tab | < 100MB for 1000 sessions |

### 9.5 Test Execution

| When | What | How |
|------|------|-----|
| On every commit | Unit tests | `npm test` (Vitest) |
| On PR to main | Unit + Integration + E2E | CI pipeline |
| Before release | Full test suite + Performance | Manual + automated |
| After migration | Data validation | `scripts/validate-frontmatter.ts` |

---

## 10. Appendix

### 10.1 Glossary

| Term | Definition |
|------|------------|
| **Data Root** | The top-level folder containing all knowledge markdown files. User-configurable. |
| **Frontmatter** | YAML metadata block at the top of markdown files, delimited by `---`. |
| **Session** | A complete OMC conversation log, including user messages, agent responses, and tool calls. |
| **Agent** | A member of the OMC team with a specific role and capabilities. |
| **Skill** | A reusable capability definition that agents can invoke during sessions. |
| **Topic** | A knowledge article, blog post, research note, or tutorial created during or outside sessions. |
| **Config** | A snapshot of an OMC configuration file. |
| **Slug** | A URL-friendly identifier (lowercase, kebab-case, no special characters). |
| **Node Bridge** | The lightweight Express.js server that reads the filesystem and serves the React app. |
| **Migration** | The one-time process of converting SQLite sessions to markdown files. |
| **File Watcher** | A service that monitors the data root for file changes and triggers UI updates. |
| **Virtualization** | A rendering technique that only renders visible items in a long list. |

### 10.2 Technology Stack Summary

| Category | Technology | Version | Status |
|----------|-----------|---------|--------|
| Frontend Framework | React | 19.x | Existing |
| Language | TypeScript | 6.x | Existing |
| Build Tool | Vite | 8.x | Existing |
| Styling | Tailwind CSS | 4.x | Existing |
| Routing | React Router | 7.x | Existing |
| State Management | Zustand | 5.x | Existing |
| Markdown Parsing | marked | 18.x | Existing |
| HTML Sanitization | DOMPurify | 3.x | Existing |
| Search | Fuse.js | 7.x | Existing |
| Date Formatting | date-fns | 4.x | Existing |
| Virtualization | @tanstack/react-virtual | 3.x | Existing |
| **Backend** | **Express.js** | **4.x/5.x** | **NEW** |
| **File Watching** | **chokidar** | **3.x** | **NEW** |
| **YAML Parsing** | **js-yaml** | **4.x** | **NEW** |
| **SQLite Reading** | **better-sqlite3** | **11.x** | **NEW** |
| **WebSocket** | **ws** | **8.x** | **NEW** |
| **Charts** | **Recharts** | **2.x** | **NEW (MAY)** |
| Testing | Playwright | 1.x | Existing |
| Testing | Vitest | 2.x | NEW (recommended) |

### 10.3 Files to Create/Modify

#### New Files (Server)

| File | Purpose |
|------|---------|
| `server/package.json` | Server dependencies |
| `server/tsconfig.json` | Server TypeScript config |
| `server/index.ts` | Server entry point |
| `server/config.ts` | Server configuration |
| `server/routes/config.ts` | Config API endpoints |
| `server/routes/sessions.ts` | Session API endpoints |
| `server/routes/agents.ts` | Agent API endpoints |
| `server/routes/skills.ts` | Skill API endpoints |
| `server/routes/topics.ts` | Topic API endpoints |
| `server/routes/configs.ts` | Config file API endpoints |
| `server/routes/stats.ts` | Stats API endpoints |
| `server/routes/search.ts` | Search API endpoints |
| `server/routes/migration.ts` | Migration API endpoints |
| `server/services/file-reader.ts` | Markdown file reading |
| `server/services/frontmatter-parser.ts` | YAML frontmatter parsing |
| `server/services/search-index.ts` | Search index management |
| `server/services/file-watcher.ts` | File system watching |
| `server/services/stats-aggregator.ts` | Statistics computation |
| `server/services/migration-engine.ts` | SQLite → Markdown migration |
| `server/middleware/validate-root.ts` | Data root validation |
| `server/middleware/error-handler.ts` | Global error handling |
| `server/types/index.ts` | Shared TypeScript types |

#### New Files (Client)

| File | Purpose |
|------|---------|
| `src/routes/SetupPage.tsx` | F1: Directory selection |
| `src/routes/SessionsPage.tsx` | F2: Session list |
| `src/routes/SessionDetailPage.tsx` | F3: Session detail |
| `src/routes/AgentsPage.tsx` | F4: Agent overview |
| `src/routes/AgentDetailPage.tsx` | F5: Agent detail |
| `src/routes/SkillsPage.tsx` | F6: Skills browser |
| `src/routes/SkillDetailPage.tsx` | Skill detail |
| `src/routes/TopicsPage.tsx` | F8: Topics browser |
| `src/routes/TopicDetailPage.tsx` | F9: Topic detail |
| `src/routes/ConfigsPage.tsx` | F7: Config viewer |
| `src/routes/ConfigDetailPage.tsx` | Config detail |
| `src/routes/StatsPage.tsx` | F10: Stats dashboard |
| `src/routes/MigrationPage.tsx` | F12: Migration tool |
| `src/components/layout/Sidebar.tsx` | Navigation sidebar (REWRITE) |
| `src/components/layout/TopBar.tsx` | Top navigation bar |
| `src/components/layout/StatusBar.tsx` | Bottom status bar |
| `src/components/layout/Breadcrumbs.tsx` | Breadcrumb navigation |
| `src/components/shared/MarkdownRenderer.tsx` | Markdown → HTML |
| `src/components/shared/StatusBadge.tsx` | Status badge |
| `src/components/shared/TagList.tsx` | Tag display |
| `src/components/shared/EmptyState.tsx` | Empty state |
| `src/components/shared/LoadingSkeleton.tsx` | Loading placeholder |
| `src/components/shared/ErrorBoundary.tsx` | Error boundary |
| `src/components/sessions/SessionList.tsx` | Session list/table |
| `src/components/sessions/SessionCard.tsx` | Session card |
| `src/components/sessions/SessionFilters.tsx` | Filter bar |
| `src/components/sessions/SessionTOC.tsx` | Table of contents |
| `src/components/agents/AgentGrid.tsx` | Agent card grid |
| `src/components/agents/AgentCard.tsx` | Agent card |
| `src/components/skills/SkillList.tsx` | Skill list |
| `src/components/skills/SkillCard.tsx` | Skill card |
| `src/components/topics/TopicList.tsx` | Topic list |
| `src/components/topics/TopicCard.tsx` | Topic card |
| `src/components/search/SearchBar.tsx` | Global search input |
| `src/components/search/SearchResults.tsx` | Search results |
| `src/components/stats/StatCards.tsx` | Summary stat cards |
| `src/components/stats/TimelineChart.tsx` | Time series chart |
| `src/components/stats/AgentChart.tsx` | Agent breakdown chart |
| `src/hooks/useApi.ts` | API request hook |
| `src/hooks/useFileWatcher.ts` | WebSocket file watcher hook |
| `src/hooks/useDebounce.ts` | Debounce hook |
| `src/state/app-store.ts` | App state store |
| `src/state/filter-store.ts` | Filter state store |
| `src/state/search-store.ts` | Search state store |
| `src/services/api.ts` | API client |
| `src/services/websocket.ts` | WebSocket client |
| `src/types/session.ts` | Session types |
| `src/types/agent.ts` | Agent types |
| `src/types/skill.ts` | Skill types |
| `src/types/topic.ts` | Topic types |
| `src/types/config.ts` | Config types |
| `src/types/stats.ts` | Stats types |
| `src/types/search.ts` | Search types |
| `src/types/api.ts` | API response types |
| `src/utils/date.ts` | Date formatting |
| `src/utils/tokens.ts` | Token formatting |
| `src/utils/validation.ts` | Frontmatter validation |

#### Modified Files

| File | Change |
|------|--------|
| `package.json` | Add server dependencies, update scripts |
| `vite.config.ts` | Add proxy configuration for API |
| `tsconfig.json` | Update for new project structure |
| `src/routes/App.tsx` | Complete rewrite for new layout |
| `src/main.tsx` | Update routing setup |
| `src/index.css` | Update design system tokens |
| `src/state/note-store.ts` | REPLACE with new stores |
| `src/state/ui-store.ts` | UPDATE for new UI state |
| `src/storage/db.ts` | DEPRECATE (no longer using IndexedDB for sessions) |

#### Scripts

| File | Purpose |
|------|---------|
| `scripts/migrate-sqlite-to-markdown.ts` | Standalone migration script |
| `scripts/validate-frontmatter.ts` | Frontmatter validation script |

### 10.4 Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R1 | SQLite schema differs from expected | Medium | High | Phase 1.1 includes schema analysis before migration script development |
| R2 | Migration data loss | Low | Critical | Dry-run mode (US-F12-4), validation report (US-F12-3), keep SQLite backup |
| R3 | File watcher performance with large directories | Medium | Medium | Debounce events (500ms), batch updates, use chokidar's efficient watching |
| R4 | Search performance with 10,000+ files | Medium | Medium | Build index on server, use Fuse.js efficiently, paginate results |
| R5 | Markdown rendering XSS vulnerability | Low | Critical | Always sanitize with DOMPurify, never use `dangerouslySetInnerHTML` without sanitization |
| R6 | Path traversal security vulnerability | Low | Critical | Validate all file paths against data root, use `path.resolve()` and `startsWith()` check |
| R7 | React 19 compatibility issues with existing dependencies | Low | Medium | Test all existing dependencies with React 19 before Phase 1 |
| R8 | better-sqlite3 native module build failures | Medium | Medium | Provide `sql.js` as fallback (pure JavaScript, no native compilation) |
| R9 | Large session files (>1MB) cause rendering lag | Low | Medium | Implement lazy loading for session body, show TOC first |
| R10 | Concurrent file modifications during migration | Low | Medium | Lock mechanism during migration, warn user not to use opencode CLI during migration |

### 10.5 Decision Log

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| D1 | Use Express.js for bridge server | Lightweight, well-documented, TypeScript support, large ecosystem | 2025-04-12 |
| D2 | Replace IndexedDB with filesystem reading | Aligns with "filesystem as database" principle, single source of truth | 2025-04-12 |
| D3 | Use Fuse.js for search (not full-text search engine) | Sufficient for local use, already in dependencies, no external service needed | 2025-04-12 |
| D4 | Use WebSocket (not SSE) for file watching | Bidirectional communication needed for subscribe/unsubscribe | 2025-04-12 |
| D5 | Keep existing Tailwind CSS 4 setup | Already configured, no reason to change | 2025-04-12 |
| D6 | Use `marked` + `DOMPurify` for markdown rendering | Already in dependencies, proven combination, secure | 2025-04-12 |
| D7 | Server binds to 127.0.0.1 only | Security requirement — no external access needed | 2025-04-12 |
| D8 | Migration is one-time, not continuous | After migration, opencode CLI writes markdown directly (or future feature) | 2025-04-12 |

---

## Document Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| Requirements Architect | Scribe | ✅ Approved | 2025-04-12 |
| Stakeholder | Khoi Le | ⏳ Pending | — |
| Technical Lead | Oracle | ⏳ Pending | — |

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2025-04-12 | Scribe | Initial SRS document |

---

*This document is the single source of truth for the OMC Knowledge Dashboard. All implementation, design, and testing decisions MUST align with this specification. Any deviations MUST be documented as change requests with stakeholder approval.*
