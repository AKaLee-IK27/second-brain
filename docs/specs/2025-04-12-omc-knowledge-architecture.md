# OMC Knowledge Architecture

> **Status:** Draft  
> **Created:** 2025-04-12  
> **Last Updated:** 2025-04-12  
> **Author:** Chronicler  
> **Decision Makers:** User (Khoi Le)  
> **Context:** Pivot from PKM tool to OMC Knowledge Dashboard

---

## Table of Contents

1. [Overview](#1-overview)
2. [Data Model Specification](#2-data-model-specification)
3. [File Organization Strategy](#3-file-organization-strategy)
4. [Migration Plan](#4-migration-plan)
5. [Content Taxonomy](#5-content-taxonomy)
6. [Naming Conventions](#6-naming-conventions)
7. [Frontmatter Standards](#7-frontmatter-standards)
8. [Relationships](#8-relationships)
9. [Search & Discovery](#9-search--discovery)
10. [Future Extensibility](#10-future-extensibility)
11. [Best Practices](#11-best-practices)
12. [Appendix](#12-appendix)

---

## 1. Overview

### 1.1 Purpose

This document defines the complete data architecture for the **OMC Knowledge Dashboard** — a read-only React web application that visualizes, arranges, and displays all knowledge stored as markdown files in the user's filesystem.

### 1.2 Core Principles

| Principle | Description |
|-----------|-------------|
| **Markdown-First** | All data is `.md` files with YAML frontmatter. Human-readable, version-controllable, portable. |
| **Filesystem as Database** | The user's chosen folder IS the database. No external DB required. |
| **Read-Only Visualization** | The web app displays and organizes knowledge. All creation/editing happens via `opencode` CLI. |
| **No Chat in App** | Users chat directly via `opencode` CLI. The dashboard is purely for visualization and discovery. |
| **Configurable Data Root** | Users can select any local folder as their knowledge base root. |
| **Self-Describing** | Every file contains enough metadata in frontmatter to be understood in isolation. |

### 1.3 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    OMC Knowledge Dashboard               │
│                      (React Web App)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Sessions │  │  Agents  │  │  Skills  │  │  Topics  │ │
│  │  View    │  │  View    │  │  View    │  │  View    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │              │              │              │       │
│  ┌────┴──────────────┴──────────────┴──────────────┴─────┐│
│  │              File System Reader Layer                  ││
│  │         (reads .md files + YAML frontmatter)           ││
│  └────────────────────────┬───────────────────────────────┘│
│                           │                                 │
│  ┌────────────────────────┴───────────────────────────────┐│
│  │                  Data Root Folder                       ││
│  │              (~/second-brain/ or user-chosen)           ││
│  │  ┌──────────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ││
│  │  │sessions/ │ │agents/│ │skills/│ │topics/│ │configs/│ ││
│  │  │          │ │       │ │       │ │       │ │       │ ││
│  │  └──────────┘ └───────┘ └───────┘ └───────┘ └───────┘ ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      opencode CLI                            │
│              (Creates/edits sessions, configs)                │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Content Types

| Type | Directory | Purpose | Source |
|------|-----------|---------|--------|
| **Sessions** | `sessions/` | OMC conversation logs | Auto-generated from opencode |
| **Agents** | `agents/` | Agent team definitions | Manual + auto-generated |
| **Skills** | `skills/` | Skill definitions | Manual + auto-generated |
| **Topics** | `topics/` | Blogs, articles, research notes | Manual via opencode |
| **Configs** | `configs/` | OMC configuration files | Auto-synced from opencode |

---

## 2. Data Model Specification

### 2.1 Session Schema

Sessions are the core content type — complete logs of opencode conversations.

#### File: `sessions/YYYY-MM/slug.md`

```yaml
---
# === IDENTITY ===
id: "ses_abc123"                    # Required. Unique session ID from opencode
slug: "eager-moon"                  # Required. URL-friendly identifier
title: "Research ai-devkit.com"     # Required. Human-readable title

# === CONTEXT ===
directory: "/path/to/project"       # Required. Working directory of session
agent: "researcher"                 # Required. Primary agent used
model: "kimi-k2.5"                  # Required. LLM model used
preset: "alibaba-coding-plan"       # Optional. Preset configuration

# === TIMESTAMPS ===
createdAt: "2025-04-12T10:30:00Z"  # Required. ISO 8601 UTC
updatedAt: "2025-04-12T10:35:00Z"  # Required. ISO 8601 UTC
duration: 300                       # Optional. Session duration in seconds

# === METRICS ===
tokens:                             # Required. Token usage breakdown
  input: 1234                       #   Input tokens (user messages)
  output: 567                       #   Output tokens (assistant responses)
  reasoning: 89                     #   Reasoning tokens (if applicable)
  total: 1890                       #   Total tokens (computed: input + output + reasoning)
cost: 0.00234                       # Required. Total cost in USD
currency: "USD"                     # Optional. Currency code (default: USD)

# === CLASSIFICATION ===
tags: ["research", "ai-devkit"]     # Optional. Array of lowercase tags
status: "completed"                 # Required. Enum: active | completed | failed | abandoned
outcome: "Found API documentation"  # Optional. Brief summary of session outcome

# === RELATIONSHIPS ===
parentSession: "ses_xyz789"         # Optional. ID of parent session (for follow-ups)
relatedSessions: ["ses_def456"]     # Optional. Array of related session IDs
relatedTopics: ["topic-ai-tools"]   # Optional. Array of related topic slugs
agentsUsed: ["researcher", "oracle"] # Optional. All agents used in session (if multi-agent)

# === METADATA ===
version: 1                          # Required. Schema version (for future migrations)
exportedAt: "2025-04-12T11:00:00Z"  # Optional. When this was exported from SQLite
---
```

#### Body Structure

```markdown
# {title}

> **Agent:** {agent} | **Model:** {model} | **Duration:** {duration}s

## Summary

Brief AI-generated or user-written summary of what was accomplished.

## 👤 User

Initial prompt or message content...

## 🤖 Assistant ({agent})

Response content...

### Tool: bash

```bash
command executed
```

### Tool Output

command output...

## 🤖 Assistant ({agent})

Follow-up response...

[... continue conversation turns ...]

## Key Findings

- Finding 1
- Finding 2
- Finding 3

## Files Modified

- `src/utils/helper.ts` - Added validation logic
- `tests/helper.test.ts` - Added unit tests

## Next Steps

- [ ] Follow up on API rate limiting
- [ ] Research alternative approaches
```

#### Body Sections Reference

| Section | Required | Description |
|---------|----------|-------------|
| `# {title}` | Yes | H1 with session title |
| `> metadata blockquote` | No | Quick-reference metadata |
| `## Summary` | No | Brief overview of session |
| `## 👤 User` | Yes | User messages (can repeat) |
| `## 🤖 Assistant` | Yes | Assistant responses (can repeat) |
| `### Tool: {name}` | No | Tool invocations within assistant turns |
| `### Tool Output` | No | Output from tool invocations |
| `## Key Findings` | No | Extracted insights |
| `## Files Modified` | No | List of files changed during session |
| `## Next Steps` | No | Action items for follow-up |

---

### 2.2 Agent Schema

Agent definitions describe each member of the OMC team.

#### File: `agents/{agent-name}.md`

```yaml
---
# === IDENTITY ===
id: "agent_orchestrator"            # Required. Unique agent identifier
name: "Orchestrator"                # Required. Display name
slug: "orchestrator"                # Required. URL-friendly identifier
emoji: "🎭"                         # Optional. Visual identifier
number: "01"                        # Optional. Ordinal number in team

# === CLASSIFICATION ===
type: "coordinator"                 # Required. Enum: coordinator | specialist | executor
tier: "core"                        # Required. Enum: core | specialist | utility
status: "active"                    # Required. Enum: active | deprecated | experimental

# === DESCRIPTION ===
shortDescription: "Master delegator and strategic coordinator"  # Required
fullDescription: "The Orchestrator determines the optimal path..." # Required
origin: "Born from the void of complexity"  # Optional. Lore/backstory

# === CAPABILITIES ===
model: "alibaba-coding-plan/qwen3.5-plus"  # Required. Default model
skills: ["orchestration", "planning", "delegation"]  # Optional. Skill slugs
permissions: ["read", "write", "execute", "delegate"]  # Optional. Permission set

# === USAGE ===
whenToUse: "Use when planning complex tasks, coordinating multiple agents..."  # Required
examples:                                     # Optional. Usage examples
  - "Analyze this codebase and create a plan"
  - "Determine the best approach for refactoring"

# === METRICS ===
sessionsCount: 145                  # Optional. Total sessions using this agent
tokensUsed: 2500000                 # Optional. Total tokens consumed
avgCostPerSession: 0.0045           # Optional. Average cost per session

# === RELATIONSHIPS ===
coordinatesWith: ["oracle", "scribe", "sentinel"]  # Optional. Agent slugs
delegatesTo: ["explorer", "fixer", "designer"]     # Optional. Agent slugs
managedBy: null                     # Optional. Parent agent slug (for hierarchy)

# === METADATA ===
createdAt: "2025-01-01T00:00:00Z"  # Optional. When agent was defined
updatedAt: "2025-04-12T10:00:00Z"  # Optional. Last modification date
version: 1                          # Required. Schema version
---
```

#### Body Structure

```markdown
# {name}: {epithet}

*{tagline}.*

{Origin story / lore paragraph}

**Role:** `{role}`

**Model:** `{model}`

---

## Capabilities

- Capability 1
- Capability 2
- Capability 3

## When to Use

- Use case 1
- Use case 2

## Configuration

```jsonc
{
  "model": "...",
  "skills": [...],
  "permissions": [...]
}
```

## Session History

See [sessions using this agent](../sessions/?agent={slug}).
```

---

### 2.3 Skill Schema

Skill definitions describe capabilities that agents can use.

#### File: `skills/{skill-name}.md`

```yaml
---
# === IDENTITY ===
id: "skill_docs"                    # Required. Unique skill identifier
name: "docs"                        # Required. Display name
slug: "docs"                        # Required. URL-friendly identifier
emoji: "📝"                         # Optional. Visual identifier

# === CLASSIFICATION ===
category: "documentation"           # Required. Enum: documentation | development | testing | deployment | research | design | security | orchestration
status: "active"                    # Required. Enum: active | deprecated | experimental
scope: "global"                     # Required. Enum: global | project | agent-specific

# === DESCRIPTION ===
shortDescription: "Documentation generation and maintenance"  # Required
fullDescription: "Automatically generates and updates documentation..."  # Required

# === USAGE ===
triggers:                           # Optional. How to invoke
  - "/docs"
  - "/docs README"
  - "/docs API"
whenToUse: "Use when generating README files, creating API documentation..."  # Required
examples:                           # Optional. Usage examples
  - "Generate API documentation for the auth module"
  - "Update README with new setup instructions"

# === CAPABILITIES ===
capabilities:                       # Optional. What this skill can do
  - "Parse code structure"
  - "Extract function signatures"
  - "Generate parameter descriptions"
  - "Create usage examples"

# === COMPATIBILITY ===
compatibleAgents: ["chronicler", "explorer", "fixer"]  # Optional. Agent slugs
requiredTools: ["read", "write", "glob"]  # Optional. Tool dependencies

# === METRICS ===
usageCount: 89                      # Optional. Times this skill was used
avgSessionDuration: 120             # Optional. Average session duration in seconds

# === RELATIONSHIPS ===
relatedSkills: ["test", "refactor"] # Optional. Related skill slugs
prerequisites: []                   # Optional. Skills that should be loaded first

# === METADATA ===
source: "~/.config/opencode/skills/docs/SKILL.md"  # Optional. File path to source
createdAt: "2025-01-01T00:00:00Z"  # Optional. When skill was defined
updatedAt: "2025-04-12T10:00:00Z"  # Optional. Last modification date
version: 1                          # Required. Schema version
---
```

#### Body Structure

```markdown
# Skill: {name}

## Description

{Full description}

## Workflow

1. Step 1
2. Step 2
3. Step 3

## Tools Used

- `tool_name` - Description
- `tool_name` - Description

## Output Format

{Description of output}

## Examples

### Example 1: Generate README

Input: `/docs README`
Output: [Description of output]
```

---

### 2.4 Topic Schema

Topics cover blogs, articles, research notes, and general knowledge.

#### File: `topics/{category}/{slug}.md`

```yaml
---
# === IDENTITY ===
id: "topic_ai_tools_2025"          # Required. Unique topic identifier
slug: "ai-tools-landscape-2025"    # Required. URL-friendly identifier
title: "AI Development Tools Landscape 2025"  # Required. Human-readable title

# === CLASSIFICATION ===
type: "article"                    # Required. Enum: article | blog | research-note | tutorial | reference | meeting-note | idea
category: "technology"             # Required. Category slug
status: "published"                # Required. Enum: draft | published | archived
visibility: "private"              # Required. Enum: private | shared | public

# === DESCRIPTION ===
summary: "Overview of AI development tools available in 2025"  # Required
excerpt: "A comprehensive survey of..."  # Optional. Short preview text

# === TIMESTAMPS ===
createdAt: "2025-04-12T10:30:00Z"  # Required. ISO 8601 UTC
updatedAt: "2025-04-12T10:35:00Z"  # Required. ISO 8601 UTC
publishedAt: "2025-04-12T12:00:00Z" # Optional. When published

# === AUTHORSHIP ===
author: "Khoi Le"                   # Optional. Author name
source: "researcher"                # Optional. Agent that generated this (if applicable)
sourceSession: "ses_abc123"         # Optional. Session that produced this content

# === CLASSIFICATION ===
tags: ["ai", "tools", "development", "2025"]  # Optional. Array of lowercase tags
topics: ["ai-devkit", "llm-tools"]  # Optional. Related topic slugs

# === METRICS ===
readTime: 5                         # Optional. Estimated reading time in minutes
wordCount: 1200                     # Optional. Word count (can be auto-computed)

# === RELATIONSHIPS ===
parentTopic: "topic-ai-overview"    # Optional. Parent topic slug
relatedTopics: ["topic-llm-comparison"]  # Optional. Related topic slugs
relatedSessions: ["ses_abc123"]     # Optional. Related session IDs
references:                         # Optional. External references
  - url: "https://example.com"
    title: "Reference Title"

# === METADATA ===
version: 1                          # Required. Schema version
---
```

#### Body Structure

```markdown
# {title}

> **Category:** {category} | **Tags:** {tags} | **Read Time:** {readTime} min

{Content body — full markdown supported}

## Key Takeaways

- Takeaway 1
- Takeaway 2

## References

- [Reference 1](url)
- [Reference 2](url)

## Related

- [[related-topic-1]]
- [[related-topic-2]]
```

---

### 2.5 Config Schema

Configuration files from the opencode ecosystem.

#### File: `configs/{config-name}.md`

```yaml
---
# === IDENTITY ===
id: "config_opencode_main"         # Required. Unique config identifier
name: "opencode.jsonc"             # Required. Original filename
slug: "opencode-main"              # Required. URL-friendly identifier

# === CLASSIFICATION ===
type: "opencode"                   # Required. Enum: opencode | skill | agent | theme | environment
scope: "global"                    # Required. Enum: global | project | user
status: "active"                   # Required. Enum: active | deprecated | archived

# === DESCRIPTION ===
description: "Main opencode configuration file"  # Required

# === SOURCE ===
sourcePath: "~/.config/opencode/opencode.jsonc"  # Required. Original file path
lastSynced: "2025-04-12T10:00:00Z"  # Required. When last synced from source

# === RELATIONSHIPS ===
relatedConfigs: ["config-skills"]   # Optional. Related config slugs
affectsAgents: ["orchestrator", "oracle"]  # Optional. Affected agent slugs

# === METADATA ===
createdAt: "2025-01-01T00:00:00Z"  # Optional. When first tracked
updatedAt: "2025-04-12T10:00:00Z"  # Optional. Last modification date
version: 1                          # Required. Schema version
---
```

#### Body Structure

```markdown
# Config: {name}

> **Source:** `{sourcePath}` | **Last Synced:** {lastSynced}

## Description

{Description of what this config controls}

## Configuration

```jsonc
{
  // Full config content here
  "key": "value"
}
```

## Key Settings

| Setting | Value | Description |
|---------|-------|-------------|
| `model` | `kimi-k2.5` | Default model |
| `preset` | `alibaba-coding-plan` | Agent preset |

## Change History

| Date | Change |
|------|--------|
| 2025-04-12 | Initial sync |
```

---

## 3. File Organization Strategy

### 3.1 Root Structure

```
{data-root}/                           ← User-configurable root
│
├── sessions/                          ← All opencode sessions
│   ├── YYYY-MM/                       ← Monthly buckets
│   │   ├── YYYY-MM-DD-slug.md         ← Individual session files
│   │   └── ...
│   └── _index.md                      ← Auto-generated index (optional)
│
├── agents/                            ← Agent definitions
│   ├── _index.md                      ← Auto-generated team roster
│   ├── orchestrator.md
│   ├── explorer.md
│   ├── oracle.md
│   └── ...
│
├── skills/                            ← Skill definitions
│   ├── _index.md                      ← Auto-generated skill catalog
│   ├── docs.md
│   ├── test.md
│   └── ...
│
├── topics/                            ← Knowledge articles
│   ├── _index.md                      ← Auto-generated topic index
│   ├── technology/                    ← Category subdirectories
│   │   ├── ai-tools-landscape-2025.md
│   │   └── ...
│   ├── architecture/
│   │   └── ...
│   ├── tutorials/
│   │   └── ...
│   └── uncategorized/                 ← Fallback for unclassified
│       └── ...
│
├── configs/                           ← Configuration snapshots
│   ├── _index.md                      ← Auto-generated config index
│   ├── opencode-main.md
│   ├── agent-team-config.md
│   └── ...
│
├── assets/                            ← Binary assets (images, etc.)
│   ├── sessions/                      ← Session-specific assets
│   │   └── ses_abc123/
│   │       └── screenshot.png
│   └── topics/                        ← Topic-specific assets
│       └── ai-tools-landscape/
│           └── diagram.png
│
├── .second-brain/                     ← Hidden metadata directory
│   ├── schema-version.json            ← Current schema version
│   ├── tags-index.json                ← Auto-generated tag index
│   └── relationships.json             ← Auto-generated relationship map
│
└── README.md                          ← Data root overview
```

### 3.2 Directory Rules

| Rule | Description |
|------|-------------|
| **Monthly buckets for sessions** | Sessions are grouped by `YYYY-MM` to prevent directory bloat |
| **Category subdirs for topics** | Topics are organized by category for discoverability |
| **Flat structure for agents/skills** | These are finite sets — no subdirectories needed |
| **`_index.md` files** | Auto-generated indexes for dashboard navigation |
| **`.second-brain/` hidden dir** | Machine-generated metadata, not user-edited |
| **`assets/` for binaries** | Images and non-markdown files live here, organized by parent type |

### 3.3 Directory Depth Limits

| Type | Max Depth | Example |
|------|-----------|---------|
| Sessions | 2 | `sessions/2025-04/2025-04-12-eager-moon.md` |
| Agents | 1 | `agents/orchestrator.md` |
| Skills | 1 | `skills/docs.md` |
| Topics | 2 | `topics/technology/ai-tools-2025.md` |
| Configs | 1 | `configs/opencode-main.md` |
| Assets | 3 | `assets/sessions/ses_abc123/screenshot.png` |

---

## 4. Migration Plan

### 4.1 Overview

Migrate 321 existing SQLite sessions to markdown files while preserving all data and relationships.

### 4.2 Migration Steps

```
Phase 1: Analysis          ← Understand SQLite schema
Phase 2: Schema Mapping     ← Map SQLite fields to markdown frontmatter
Phase 3: Export Script      ← Build migration tool
Phase 4: Dry Run            ← Test on copy, verify output
Phase 5: Full Migration     ← Execute migration
Phase 6: Validation         ← Verify all 321 sessions migrated correctly
Phase 7: Cleanup            ← Archive SQLite, update references
```

### 4.3 Phase 1: SQLite Schema Analysis

First, examine the existing SQLite database structure:

```bash
# Locate the SQLite database
find ~/.config/opencode -name "*.db" -o -name "*.sqlite"

# Examine schema
sqlite3 <database-path> ".schema"

# Count sessions
sqlite3 <database-path> "SELECT COUNT(*) FROM sessions;"

# Sample a session
sqlite3 <database-path> "SELECT * FROM sessions LIMIT 1;"
```

Expected tables to analyze:
- `sessions` — Core session data
- `messages` — Conversation turns
- `tools` — Tool invocations
- `tokens` — Token usage data
- `costs` — Cost tracking
- `tags` — Session tags
- `agents` — Agent usage

### 4.4 Phase 2: Schema Mapping

| SQLite Field | Markdown Frontmatter | Transformation |
|--------------|---------------------|----------------|
| `sessions.id` | `id` | Direct copy |
| `sessions.slug` | `slug` | Direct copy |
| `sessions.title` | `title` | Direct copy |
| `sessions.directory` | `directory` | Direct copy |
| `sessions.agent` | `agent` | Direct copy |
| `sessions.model` | `model` | Direct copy |
| `sessions.created_at` | `createdAt` | Convert to ISO 8601 UTC |
| `sessions.updated_at` | `updatedAt` | Convert to ISO 8601 UTC |
| `sessions.duration` | `duration` | Direct copy (seconds) |
| `tokens.input` | `tokens.input` | Direct copy |
| `tokens.output` | `tokens.output` | Direct copy |
| `tokens.reasoning` | `tokens.reasoning` | Direct copy |
| `costs.total` | `cost` | Direct copy |
| `tags[]` | `tags[]` | Array join/split |
| `messages.role` | Body sections | `👤 User` / `🤖 Assistant` |
| `messages.content` | Body content | Markdown content |
| `tools.name` | `### Tool: {name}` | Section header |
| `tools.output` | `### Tool Output` | Section content |

### 4.5 Phase 3: Export Script

Create a migration script at `scripts/migrate-sqlite-to-markdown.ts`:

```typescript
// Pseudocode structure
interface MigrationConfig {
  sqlitePath: string;
  outputRoot: string;
  batchSize: number;      // Process in batches to avoid memory issues
  dryRun: boolean;        // Test mode
}

async function migrateSessions(config: MigrationConfig) {
  // 1. Connect to SQLite
  // 2. Query all sessions with joins
  // 3. For each session:
  //    a. Build frontmatter object
  //    b. Build markdown body from messages
  //    c. Determine output path: sessions/YYYY-MM/YYYY-MM-DD-slug.md
  //    d. Write markdown file
  // 4. Generate _index.md
  // 5. Generate .second-brain/ metadata
  // 6. Output migration report
}
```

### 4.6 Phase 4: Dry Run

```bash
# Run migration in dry-run mode
npx tsx scripts/migrate-sqlite-to-markdown.ts \
  --sqlite ~/.config/opencode/sessions.db \
  --output /tmp/second-brain-migration-test \
  --dry-run

# Verify output
echo "Sessions exported: $(find /tmp/second-brain-migration-test/sessions -name '*.md' | wc -l)"
echo "Expected: 321"

# Spot-check random sessions
find /tmp/second-brain-migration-test/sessions -name '*.md' | shuf | head -5 | xargs head -30
```

Validation checklist:
- [ ] All 321 sessions exported
- [ ] All frontmatter fields populated correctly
- [ ] Dates in ISO 8601 format
- [ ] Token counts match SQLite
- [ ] Costs match SQLite
- [ ] Tags preserved
- [ ] Conversation body intact
- [ ] Tool invocations preserved
- [ ] No data loss

### 4.7 Phase 5: Full Migration

```bash
# Execute full migration
npx tsx scripts/migrate-sqlite-to-markdown.ts \
  --sqlite ~/.config/opencode/sessions.db \
  --output ~/second-brain \
  --batch-size 50
```

### 4.8 Phase 6: Validation

```bash
# Count migrated files
find ~/second-brain/sessions -name '*.md' | wc -l  # Should be 321

# Validate frontmatter on all files
npx tsx scripts/validate-frontmatter.ts ~/second-brain/sessions

# Check for orphaned references
npx tsx scripts/check-references.ts ~/second-brain

# Generate validation report
npx tsx scripts/generate-migration-report.ts ~/second-brain
```

### 4.9 Phase 7: Cleanup

- Archive SQLite database: `mv ~/.config/opencode/sessions.db ~/.config/opencode/sessions.db.archived`
- Update opencode config to write markdown directly (if applicable)
- Remove migration scripts or archive them

### 4.10 Migration Timeline Estimate

| Phase | Estimated Time | Dependencies |
|-------|---------------|--------------|
| Phase 1: Analysis | 30 min | Access to SQLite DB |
| Phase 2: Schema Mapping | 1 hour | Phase 1 complete |
| Phase 3: Export Script | 2-3 hours | Phase 2 complete |
| Phase 4: Dry Run | 30 min | Phase 3 complete |
| Phase 5: Full Migration | 15 min | Phase 4 validated |
| Phase 6: Validation | 1 hour | Phase 5 complete |
| Phase 7: Cleanup | 15 min | Phase 6 validated |
| **Total** | **~5-6 hours** | |

---

## 5. Content Taxonomy

### 5.1 Tag System

Tags are the primary mechanism for content discovery and cross-referencing.

#### Tag Categories

| Category | Prefix | Examples |
|----------|--------|----------|
| **Domain** | (none) | `ai`, `flutter`, `react`, `typescript` |
| **Activity** | (none) | `research`, `debugging`, `refactoring`, `testing` |
| **Project** | `proj:` | `proj:second-brain`, `proj:omc`, `proj:ai-devkit` |
| **Agent** | `agent:` | `agent:researcher`, `agent:oracle`, `agent:fixer` |
| **Skill** | `skill:` | `skill:docs`, `skill:test`, `skill:refactor` |
| **Status** | `status:` | `status:blocked`, `status:completed`, `status:in-progress` |
| **Priority** | `priority:` | `priority:high`, `priority:medium`, `priority:low` |
| **Type** | `type:` | `type:bug`, `type:feature`, `type:spike`, `type:decision` |

#### Tag Rules

| Rule | Description |
|------|-------------|
| **Lowercase only** | All tags must be lowercase |
| **Kebab-case** | Multi-word tags use hyphens: `ai-development` |
| **No spaces** | Spaces are not allowed in tags |
| **Prefix for namespaces** | Use `prefix:value` for categorized tags |
| **Max 10 tags per session** | Prevent tag sprawl |
| **Max 20 tags per topic** | Topics can be more broadly tagged |

### 5.2 Topic Categories

Categories organize topics into browsable groups.

| Category | Slug | Description |
|----------|------|-------------|
| Technology | `technology` | Tools, frameworks, languages, platforms |
| Architecture | `architecture` | System design, patterns, decisions |
| Development | `development` | Best practices, workflows, processes |
| Research | `research` | Investigations, comparisons, surveys |
| Tutorial | `tutorial` | How-to guides, step-by-step instructions |
| Decision | `decision` | ADRs, trade-off analyses |
| Meeting | `meeting` | Meeting notes, discussions |
| Idea | `idea` | Concepts, proposals, brainstorming |
| Reference | `reference` | Cheat sheets, quick references |
| Personal | `personal` | Non-technical notes, journaling |

### 5.3 Session Statuses

| Status | Description | When to Use |
|--------|-------------|-------------|
| `active` | Session is ongoing | Currently running or paused |
| `completed` | Session finished successfully | Task accomplished |
| `failed` | Session ended with errors | Unrecoverable errors |
| `abandoned` | Session was stopped mid-way | User stopped, context lost |

### 5.4 Topic Statuses

| Status | Description |
|--------|-------------|
| `draft` | Work in progress, not ready for review |
| `published` | Complete and available |
| `archived` | No longer current but preserved |

---

## 6. Naming Conventions

### 6.1 Session Files

```
Pattern: YYYY-MM-DD-slug.md
Example: 2025-04-12-eager-moon.md
```

| Component | Format | Description |
|-----------|--------|-------------|
| `YYYY` | 4-digit year | `2025` |
| `MM` | 2-digit month | `04` |
| `DD` | 2-digit day | `12` |
| `slug` | kebab-case | Adjective-noun pair from opencode (e.g., `eager-moon`) |

**Rules:**
- Slugs are generated by opencode (adjective-noun pattern)
- Always lowercase
- Hyphens separate components
- No special characters

### 6.2 Agent Files

```
Pattern: {agent-slug}.md
Example: orchestrator.md
```

| Component | Format | Description |
|-----------|--------|-------------|
| `agent-slug` | lowercase-kebab | Agent identifier |

### 6.3 Skill Files

```
Pattern: {skill-slug}.md
Example: docs.md
```

| Component | Format | Description |
|-----------|--------|-------------|
| `skill-slug` | lowercase-kebab | Skill identifier |

### 6.4 Topic Files

```
Pattern: {category}/{descriptive-slug}.md
Example: technology/ai-tools-landscape-2025.md
```

| Component | Format | Description |
|-----------|--------|-------------|
| `category` | lowercase-kebab | Topic category |
| `descriptive-slug` | lowercase-kebab | Human-readable description |

### 6.5 Config Files

```
Pattern: {config-name}.md
Example: opencode-main.md
```

| Component | Format | Description |
|-----------|--------|-------------|
| `config-name` | lowercase-kebab | Descriptive config name |

### 6.6 Asset Files

```
Pattern: assets/{type}/{parent-id}/{descriptive-name}.{ext}
Example: assets/sessions/ses_abc123/architecture-diagram.png
```

### 6.7 ID Patterns

| Type | Pattern | Example |
|------|---------|---------|
| Session | `ses_{alphanumeric}` | `ses_abc123` |
| Agent | `agent_{name}` | `agent_orchestrator` |
| Skill | `skill_{name}` | `skill_docs` |
| Topic | `topic_{slug}` | `topic_ai_tools_2025` |
| Config | `config_{name}` | `config_opencode_main` |

---

## 7. Frontmatter Standards

### 7.1 Required vs Optional Fields

| Field Type | Sessions | Agents | Skills | Topics | Configs |
|------------|----------|--------|--------|--------|---------|
| **Identity** | | | | | |
| `id` | Required | Required | Required | Required | Required |
| `slug` | Required | Required | Required | Required | Required |
| `name` | — | Required | Required | — | Required |
| `title` | Required | — | — | Required | — |
| **Classification** | | | | | |
| `type` | — | Required | Required | Required | Required |
| `status` | Required | Required | Required | Required | Required |
| `category` | — | — | Required | Required | — |
| **Timestamps** | | | | | |
| `createdAt` | Required | Optional | Optional | Required | Optional |
| `updatedAt` | Required | Optional | Optional | Required | Optional |
| **Metrics** | | | | | |
| `tokens` | Required | — | — | — | — |
| `cost` | Required | — | — | — | — |
| **Relationships** | | | | | |
| `tags` | Optional | — | — | Optional | — |
| `relatedSessions` | Optional | — | — | Optional | — |
| `relatedTopics` | Optional | — | — | Optional | — |
| **Metadata** | | | | | |
| `version` | Required | Required | Required | Required | Required |

### 7.2 Frontmatter Validation Rules

```yaml
# Validation rules for all frontmatter
rules:
  id:
    type: string
    pattern: "^[a-z]+_[a-zA-Z0-9_]+$"
    unique: true
  
  slug:
    type: string
    pattern: "^[a-z0-9]+(-[a-z0-9]+)*$"
    unique: true
  
  createdAt:
    type: string
    format: "date-time"  # ISO 8601
  
  updatedAt:
    type: string
    format: "date-time"
  
  tags:
    type: array
    items:
      type: string
      pattern: "^[a-z0-9]+(-[a-z0-9]+)*(:[a-z0-9-]+)?$"
  
  version:
    type: integer
    minimum: 1
```

### 7.3 Schema Versioning

The `version` field in frontmatter enables future schema migrations:

```json
{
  "currentVersion": 1,
  "migrationHistory": [
    {
      "version": 1,
      "date": "2025-04-12",
      "description": "Initial schema"
    }
  ]
}
```

When the schema changes:
1. Increment `version` in new files
2. Create migration script for old files
3. Update `.second-brain/schema-version.json`
4. Document changes in this file

---

## 8. Relationships

### 8.1 Relationship Types

```
┌──────────┐     uses      ┌──────────┐
│ Session  │ ────────────► │  Agent   │
│          │               └──────────┘
│          │     uses      ┌──────────┐
│          │ ────────────► │  Skill   │
│          │               └──────────┘
│          │   produces    ┌──────────┐
│          │ ────────────► │  Topic   │
│          │               └──────────┘
│          │  references   ┌──────────┐
│          │ ────────────► │  Config  │
└──────────┘               └──────────┘

┌──────────┐   related    ┌──────────┐
│ Session  │ ◄──────────► │ Session  │  (follow-ups, continuations)
└──────────┘              └──────────┘

┌──────────┐   related    ┌──────────┐
│  Topic   │ ◄──────────► │  Topic   │  (series, prerequisites)
└──────────┘              └──────────┘

┌──────────┐   affects    ┌──────────┐
│  Config  │ ────────────► │  Agent   │
└──────────┘              └──────────┘
```

### 8.2 Relationship Fields

| From | To | Field | Cardinality |
|------|-----|-------|-------------|
| Session | Agent | `agent` (primary), `agentsUsed` (all) | 1:N |
| Session | Session | `parentSession`, `relatedSessions` | 1:N |
| Session | Topic | `relatedTopics` | N:M |
| Topic | Session | `sourceSession` | N:1 |
| Topic | Topic | `parentTopic`, `relatedTopics` | 1:N, N:M |
| Config | Agent | `affectsAgents` | N:M |
| Skill | Agent | `compatibleAgents` | N:M |
| Agent | Agent | `coordinatesWith`, `delegatesTo` | N:M |

### 8.3 Relationship Index

The `.second-brain/relationships.json` file maintains a bidirectional index:

```json
{
  "sessions": {
    "ses_abc123": {
      "usesAgent": ["agent_researcher"],
      "usesSkills": ["skill_docs"],
      "producedTopics": ["topic_ai_tools_2025"],
      "parentSession": null,
      "relatedSessions": ["ses_def456"],
      "referencedConfigs": ["config_opencode_main"]
    }
  },
  "agents": {
    "agent_researcher": {
      "usedInSessions": ["ses_abc123", "ses_def456"],
      "compatibleSkills": ["skill_docs", "skill_researcher"],
      "coordinatesWith": ["agent_orchestrator"]
    }
  },
  "topics": {
    "topic_ai_tools_2025": {
      "sourceSession": "ses_abc123",
      "relatedTopics": ["topic_llm_comparison"],
      "parentTopic": null
    }
  }
}
```

This index is auto-generated and should not be manually edited.

---

## 9. Search & Discovery

### 9.1 Search Strategies

| Strategy | Implementation | Use Case |
|----------|---------------|----------|
| **Frontmatter filtering** | Parse YAML frontmatter | Filter by date, agent, tags, status |
| **Full-text search** | Search markdown body content | Find specific content within sessions |
| **Tag-based browsing** | Use `.second-brain/tags-index.json` | Browse by topic area |
| **Timeline navigation** | Use directory structure + dates | Browse chronologically |
| **Relationship traversal** | Use `.second-brain/relationships.json` | Find related content |

### 9.2 Tag Index

Auto-generated at `.second-brain/tags-index.json`:

```json
{
  "tags": {
    "research": {
      "count": 45,
      "sessions": ["ses_abc123", "ses_def456"],
      "topics": ["topic_ai_tools_2025"]
    },
    "flutter": {
      "count": 23,
      "sessions": ["ses_ghi789"],
      "topics": ["topic-flutter-state-mgmt"]
    }
  },
  "categories": {
    "technology": {
      "count": 12,
      "topics": ["topic_ai_tools_2025", "topic-flutter-state-mgmt"]
    }
  },
  "agents": {
    "researcher": {
      "sessionCount": 89,
      "totalTokens": 2500000,
      "totalCost": 0.045
    }
  }
}
```

### 9.3 Search Index Fields

For full-text search, index the following:

| Field | Weight | Description |
|-------|--------|-------------|
| `title` | 10x | Highest priority |
| `tags` | 8x | High priority |
| `summary` / `excerpt` | 5x | Medium-high priority |
| `agent` / `model` | 3x | Medium priority |
| Body content | 1x | Base priority |
| Tool names | 2x | Low-medium priority |

### 9.4 Dashboard Views

| View | Data Source | Description |
|------|-------------|-------------|
| **Timeline** | Sessions by date | Chronological session browser |
| **Agent Activity** | Sessions grouped by agent | Per-agent usage stats |
| **Tag Cloud** | Tags index | Visual tag frequency display |
| **Topic Browser** | Topics by category | Categorized knowledge articles |
| **Stats Dashboard** | Aggregated metrics | Token usage, costs, trends |
| **Session Detail** | Individual session file | Full conversation view |
| **Agent Roster** | Agent definitions | Team overview |
| **Skill Catalog** | Skill definitions | Available capabilities |
| **Config Viewer** | Config snapshots | Configuration history |

---

## 10. Future Extensibility

### 10.1 Adding New Content Types

To add a new content type (e.g., `projects/`):

1. **Define schema** — Add to Section 2 of this document
2. **Create directory** — Add to root structure (Section 3)
3. **Define naming** — Add to naming conventions (Section 6)
4. **Update relationships** — Add relationship types (Section 8)
5. **Update search** — Add to search index (Section 9)
6. **Increment schema version** — Update `.second-brain/schema-version.json`

### 10.2 Schema Evolution

When the schema needs to change:

```
1. Increment version in .second-brain/schema-version.json
2. Add migration entry to migrationHistory
3. Create migration script: scripts/migrate-v{N}-to-v{N+1}.ts
4. Update this document with new fields
5. Run migration on existing files
6. Validate all files pass new schema
```

### 10.3 Reserved Directory Names

These directory names are reserved and should not be used for custom content:

```
sessions/
agents/
skills/
topics/
configs/
assets/
.second-brain/
_index.md
README.md
```

### 10.4 Custom Content Types

Users can add custom content types outside the reserved directories:

```
{data-root}/
├── sessions/
├── agents/
├── ...
├── projects/              ← Custom type
│   ├── second-brain.md
│   └── ai-devkit.md
└── bookmarks/             ← Custom type
    └── useful-links.md
```

Custom types should follow the same frontmatter conventions:
- Include `id`, `slug`, `version` fields
- Include `createdAt`, `updatedAt` timestamps
- Use consistent naming conventions

### 10.5 Plugin Architecture (Future)

Future dashboard versions may support plugins that:
- Read custom content types
- Add new visualization views
- Extend search capabilities
- Import from external sources

Plugins should declare:
```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "contentTypes": ["projects", "bookmarks"],
  "views": ["project-timeline", "bookmark-grid"],
  "searchFields": ["title", "description", "url"]
}
```

---

## 11. Best Practices

### 11.1 File Management

| Practice | Description |
|----------|-------------|
| **Never edit `.second-brain/` manually** | This directory is auto-generated |
| **Use frontmatter consistently** | All files must have valid YAML frontmatter |
| **Keep slugs unique** | Duplicate slugs cause navigation issues |
| **Use ISO 8601 for dates** | Always UTC, always full format |
| **Validate before committing** | Run validation scripts on changes |
| **Don't delete sessions** | Use `status: abandoned` instead |
| **Archive, don't delete** | Move old topics to `status: archived` |

### 11.2 Tagging Guidelines

| Practice | Description |
|----------|-------------|
| **Be specific** | `flutter-state-management` > `flutter` |
| **Use prefixes** | `proj:second-brain` not `second-brain` |
| **Limit quantity** | Max 10 tags per session, 20 per topic |
| **Be consistent** | Use existing tags before creating new ones |
| **Lowercase only** | `react` not `React` or `REACT` |
| **Kebab-case** | `ai-development` not `ai_development` or `aiDevelopment` |

### 11.3 Content Quality

| Practice | Description |
|----------|-------------|
| **Write meaningful titles** | Descriptive, not generic |
| **Add summaries** | Help future-you understand quickly |
| **Extract key findings** | Don't bury insights in conversation |
| **Link related content** | Use `relatedSessions` and `relatedTopics` |
| **Document decisions** | Use `outcome` field for session results |
| **Keep topics focused** | One main idea per topic file |

### 11.4 Maintenance

| Task | Frequency | Tool |
|------|-----------|------|
| Validate frontmatter | Weekly | `scripts/validate-frontmatter.ts` |
| Rebuild tag index | After bulk changes | `scripts/rebuild-index.ts` |
| Check orphaned references | Monthly | `scripts/check-references.ts` |
| Archive old sessions | Quarterly | Manual review |
| Update schema version | When schema changes | Manual + migration script |

### 11.5 Performance Guidelines

| Guideline | Threshold | Action |
|-----------|-----------|--------|
| Sessions per month directory | < 200 | Split by week if exceeded |
| Topics per category | < 100 | Add subcategories if exceeded |
| Total markdown files | < 10,000 | Consider pagination in dashboard |
| Tag index size | < 1,000 tags | Consolidate similar tags |
| Asset directory size | < 500 MB | Compress or externalize |

---

## 12. Appendix

### 12.1 Glossary

| Term | Definition |
|------|------------|
| **Data Root** | The top-level folder containing all knowledge files |
| **Frontmatter** | YAML metadata at the top of markdown files |
| **Slug** | URL-friendly identifier (lowercase, hyphens) |
| **Session** | A single opencode conversation |
| **Topic** | A knowledge article, blog, or research note |
| **Agent** | A member of the OMC team |
| **Skill** | A capability that agents can use |
| **Schema Version** | Integer tracking the data model version |

### 12.2 File Type Quick Reference

| Type | Directory | Required Fields | Naming |
|------|-----------|----------------|--------|
| Session | `sessions/YYYY-MM/` | `id`, `slug`, `title`, `agent`, `model`, `createdAt`, `tokens`, `cost`, `status`, `version` | `YYYY-MM-DD-slug.md` |
| Agent | `agents/` | `id`, `name`, `slug`, `type`, `tier`, `status`, `whenToUse`, `version` | `{slug}.md` |
| Skill | `skills/` | `id`, `name`, `slug`, `category`, `status`, `whenToUse`, `version` | `{slug}.md` |
| Topic | `topics/{category}/` | `id`, `slug`, `title`, `type`, `category`, `status`, `createdAt`, `version` | `{slug}.md` |
| Config | `configs/` | `id`, `name`, `slug`, `type`, `scope`, `sourcePath`, `lastSynced`, `version` | `{slug}.md` |

### 12.3 Validation Checklist

Before considering a file valid:

```
Session Validation:
  [ ] Has valid YAML frontmatter
  [ ] id matches pattern ses_{alphanumeric}
  [ ] slug is unique
  [ ] createdAt is valid ISO 8601
  [ ] tokens object has input, output, total
  [ ] cost is a positive number
  [ ] status is valid enum value
  [ ] version is present
  [ ] Body has at least one User and one Assistant section

Agent Validation:
  [ ] Has valid YAML frontmatter
  [ ] id matches pattern agent_{name}
  [ ] slug is unique
  [ ] type is valid enum value
  [ ] tier is valid enum value
  [ ] whenToUse is non-empty
  [ ] version is present

Skill Validation:
  [ ] Has valid YAML frontmatter
  [ ] id matches pattern skill_{name}
  [ ] slug is unique
  [ ] category is valid enum value
  [ ] whenToUse is non-empty
  [ ] version is present

Topic Validation:
  [ ] Has valid YAML frontmatter
  [ ] id matches pattern topic_{slug}
  [ ] slug is unique
  [ ] type is valid enum value
  [ ] category is valid enum value
  [ ] status is valid enum value
  [ ] createdAt is valid ISO 8601
  [ ] version is present

Config Validation:
  [ ] Has valid YAML frontmatter
  [ ] id matches pattern config_{name}
  [ ] slug is unique
  [ ] type is valid enum value
  [ ] sourcePath is non-empty
  [ ] lastSynced is valid ISO 8601
  [ ] version is present
```

### 12.4 Example File Paths

```
# Sessions
~/second-brain/sessions/2025-04/2025-04-12-eager-moon.md
~/second-brain/sessions/2025-04/2025-04-13-calm-river.md
~/second-brain/sessions/2025-03/2025-03-28-bold-eagle.md

# Agents
~/second-brain/agents/orchestrator.md
~/second-brain/agents/researcher.md
~/second-brain/agents/oracle.md

# Skills
~/second-brain/skills/docs.md
~/second-brain/skills/test.md
~/second-brain/skills/refactor.md

# Topics
~/second-brain/topics/technology/ai-tools-landscape-2025.md
~/second-brain/topics/architecture/clean-architecture-patterns.md
~/second-brain/topics/tutorials/flutter-bloc-setup.md

# Configs
~/second-brain/configs/opencode-main.md
~/second-brain/configs/agent-team-roster.md

# Assets
~/second-brain/assets/sessions/ses_abc123/screenshot.png
~/second-brain/assets/topics/ai-tools-landscape/diagram.png
```

### 12.5 Document History

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-04-12 | 1.0 | Initial architecture document | Chronicler |

---

*This document is the single source of truth for how all data is structured and organized in the OMC Knowledge Dashboard. All team members (developers, designers, agents) should reference this document when working with knowledge base content.*