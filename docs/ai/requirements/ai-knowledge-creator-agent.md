# Requirement: AI Knowledge Creator Agent and Vault Writer Skill

**Date:** 2026-04-14
**Status:** Reviewed (Revised 2026-04-14)
**Author:** Scribe
**Reviewed by:** Oracle (2026-04-14) — 10 issues identified, all fixed

## Context

The AKL Knowledge (second-brain) application is a **read-only visualization dashboard** — all content creation currently happens externally via the opencode CLI. The vault stores markdown files with YAML frontmatter, and the server provides REST API routes for reading topics, sessions, agents, skills, and other content types.

The user wants to **chat conversationally with a specialized AI agent** that can create topics, blogs, articles, and other knowledge content directly into the vault, closing the loop between conversation and knowledge capture.

## User Story

As a user building a second brain, I want to chat with a specialized AI agent that can create well-structured topics, blogs, and knowledge articles in my vault so that I can capture insights and produce content through natural conversation without manually writing markdown files.

## Acceptance Criteria

### Agent Definition

- [ ] Given the opencode agents directory, when a new agent is registered, then an agent named "Knowledge Creator" exists with slug `knowledge-creator`, type `specialist`, tier `specialist`, and status `active`
- [ ] Given the Knowledge Creator agent definition, when rendered in the dashboard, then it displays a `whenToUse` description stating it creates topics, blogs, articles, and knowledge content in the vault through conversational interaction
- [ ] Given the Knowledge Creator agent, when invoked, then it has `mode: "primary"` to allow direct user interaction (not just orchestrator delegation)
- [ ] Given the Knowledge Creator agent, when configured, then it uses `temperature: 0.6` for balanced creative content generation
- [ ] Given the Knowledge Creator agent, when invoked, then it has access to the Vault Writer skill (defined below)

### Skill Definition

- [ ] Given the opencode skills directory, when a new skill is registered, then a skill named "Vault Writer" exists with slug `vault-writer`, category `knowledge-management`, and status `active`
- [ ] Given the Vault Writer skill, when loaded, then it provides the agent with the capability to create, update, and draft markdown files in the vault with YAML frontmatter containing all required fields (id, slug, title, type, category, status, createdAt, updatedAt, version) as defined in the TopicFrontmatter interface
- [ ] Given the Vault Writer skill, when creating a topic, then the generated markdown file includes all required frontmatter fields: `id`, `slug`, `title`, `type`, `category`, `status`, `createdAt`, `updatedAt`, `version`
- [ ] Given the Vault Writer skill, when updating an existing topic, then the `updatedAt` field is set to the current ISO 8601 timestamp
- [ ] Given the Vault Writer skill, when creating a topic, then the `type` field is one of: `article`, `blog`, `research-note`, `tutorial`, `reference`, `meeting-note`, `idea`
- [ ] Given the Vault Writer skill, when creating a topic, then the `status` field defaults to `draft` unless the user explicitly requests `published`
- [ ] Given the Vault Writer skill, when generating a slug, then it checks for existing topics with the same slug and appends a numeric suffix if a collision is detected (e.g., `flutter-state-management-2`)
- [ ] Given the Vault Writer skill, before writing any file, then it validates that all required frontmatter fields are present and conform to these validity rules:
  - `id`: matches pattern `topic_<snake_case_slug>` (lowercase letters, digits, underscores, no spaces)
  - `slug`: URL-safe lowercase string with hyphens only (regex: `^[a-z0-9]+(-[a-z0-9]+)*$`)
  - `title`: non-empty string, minimum 3 characters
  - `type`: one of `article`, `blog`, `research-note`, `tutorial`, `reference`, `meeting-note`, `idea`
  - `category`: one of `documentation`, `tutorial`, `reference`, `technology`, `blog`
  - `status`: one of `draft`, `published`, `archived`
  - `createdAt`: valid ISO 8601 timestamp (e.g., `2026-04-14T10:30:00Z`)
  - `updatedAt`: valid ISO 8601 timestamp or absent
  - `version`: positive integer (minimum 1)
- [ ] Given the Vault Writer skill, when generating a slug, then it produces a URL-safe lowercase string with hyphens (e.g., "Flutter State Management Guide" → `flutter-state-management-guide`)
- [ ] Given the Vault Writer skill, when generating an ID, then it produces a unique identifier matching the pattern `topic_<snake_case_slug>` that does not conflict with any existing topic ID in the vault
- [ ] Given the Vault Writer skill, when generating a `createdAt` timestamp, then it uses ISO 8601 format (e.g., `2026-04-14T10:30:00Z`)

### Chat Interaction Flow

- [ ] Given the user starts a conversation with the Knowledge Creator agent without specifying content type, topic, category, or target audience, when the agent responds, then it asks for each missing field individually before generating content
- [ ] Given the user provides content requirements, when the agent generates a draft, then the output is a markdown document containing: YAML frontmatter with all required fields, at least two H2 sections, and a minimum of 200 words of body content
- [ ] Given the agent generates a draft, when presented to the user, then the user can request revisions before the content is written to the vault
- [ ] Given the user rejects a draft without requesting revisions, when the agent responds, then it discards the draft and asks the user for new content requirements including topic, type, and scope
- [ ] Given the user approves a draft, when the agent writes to the vault, then the file is saved to `topics/{category}/{slug}.md` where `{category}` matches the frontmatter category field and `{slug}` matches the frontmatter slug field
- [ ] Given the Vault Writer skill attempts to write to a path outside the `topics/` directory, when the path validation runs, then it aborts the write and reports: "Write rejected: target path must be within topics/ directory"
- [ ] Given the user requests changes to an existing topic, when the agent updates the file, then the `version` field in the frontmatter is incremented by 1
- [ ] Given the user requests a blog post without specifying a category, when the agent responds, then it asks the user to choose a category before proceeding

### Vault Integration

- [ ] Given the Vault Writer skill writes a new topic, when the file is created, then it is placed in the vault's topics directory following the existing path structure
- [ ] Given the Vault Writer skill creates a blog-type topic, when the file is created, then it is placed in the `topics/blog/` subdirectory (new category directory to be created)
- [ ] Given the Vault Writer skill writes a file, when the operation completes, then the server's file watcher detects the new file and triggers re-indexing
- [ ] Given the Vault Writer skill writes a file, when the frontmatter is generated, then it conforms to the existing `TopicFrontmatter` interface defined in `server/types/index.ts`
- [ ] Given the Vault Writer skill attempts to write to the vault, when the vault path is invalid or inaccessible, then the agent reports the error to the user with the format: "Failed to write file: {error reason}. Please check vault permissions and try again."
- [ ] Given the Vault Writer skill creates a topic with `relatedTopics`, when the frontmatter is generated, then the `relatedTopics` field contains an array of valid topic IDs that exist in the vault
- [ ] Given the user specifies relatedTopics that do not exist in the vault, when the agent validates the references, then it warns the user with the message "The following topics were not found: {list}. They will be omitted from relatedTopics." and omits the invalid IDs from the frontmatter

### Content Quality

- [ ] Given the agent generates content, when the markdown body is produced, then it uses exactly one H1 for the title, H2 for top-level sections, and H3 for subsections. No H4 or deeper headings are used
- [ ] Given the agent generates content, when the markdown body contains code blocks, then they include language identifiers for syntax highlighting
- [ ] Given the agent generates content, when the markdown body contains internal references, then it uses the `[[wikilink]]` syntax consistent with the existing backlink system
- [ ] Given the agent generates a research-note type topic, when the body is produced, then it includes sections for: Summary, Key Findings, Sources, and Notes
- [ ] Given the agent generates a tutorial type topic, when the body is produced, then it includes sections for: Prerequisites, Steps, and Summary
- [ ] Given the agent generates a blog type topic, when the body is produced, then it includes an introduction, body sections, and conclusion

### Dashboard UX

- [ ] Given the dashboard displays topics, when a topic has `status: "draft"`, then it shows a yellow "Draft" badge next to the topic title
- [ ] Given the dashboard topic list, when viewed, then users can filter to show only published topics or include drafts

### Error Handling

- [ ] Given the user requests a topic with a slug that already exists in the target category, when the Vault Writer skill performs its pre-write slug uniqueness check, then it appends a numeric suffix to the slug (e.g., `flutter-state-management-2`), increments the suffix until a unique slug is found, and the agent informs the user: "A topic with slug '{slug}' already exists. Using '{new-slug}' instead."
- [ ] Given the agent fails to write a file, when the error occurs, then it retries once before reporting failure to the user
- [ ] Given the user provides content instructions with fewer than 10 words and no content type keyword (article, blog, research-note, tutorial, reference, meeting-note, idea), when the agent responds, then it asks for clarification about the desired content type and topic before proceeding

## Constraints

### Technical
- The agent and skill must follow the existing opencode agent/skill definition format (YAML frontmatter + markdown body)
- The vault file structure must remain unchanged — markdown files with YAML frontmatter
- The server's file watcher (`server/services/file-watcher.ts`) handles re-indexing — the skill writes files directly to disk
- The `TopicFrontmatter` interface in `server/types/index.ts` must be updated to include `updatedAt?: string`
- A new `blog/` category directory must be created under `topics/`
- No changes to the IndexedDB caching layer — the file watcher triggers cache updates
- The agent uses the existing opencode conversation infrastructure (no new chat UI needed)
- The agent's write permissions must be restricted to `topics/**` only (not root vault)

### Business
- Content defaults to `draft` status — user must explicitly request `published`
- The agent cannot delete existing content — only create and update
- The agent cannot modify sessions, agents, skills, or configs — only topics
- All content creation is local-first — no external API calls for content storage
- The agent must cite sources when generating research content (no fabricated references)

### Performance
- Content generation must complete within 30 seconds for topics up to 2000 words
- File write operations must complete within 2 seconds
- The agent must not block the file watcher's re-indexing cycle

## Out of Scope

- Real-time collaborative editing of vault content
- Image or media file generation and embedding
- Automatic translation of content into multiple languages
- Content scheduling or delayed publishing
- Integration with external CMS or publishing platforms (e.g., WordPress, Medium)
- AI-generated images, diagrams, or illustrations
- Voice-to-text input for content creation
- Content analytics or engagement tracking
- Bulk content generation (e.g., "create 10 blog posts at once")
- Changes to the session, agent, skill, or config data models (except TopicFrontmatter updatedAt addition)
- Natural language search improvements (handled by existing Fuse.js implementation)
- Graph view enhancements (handled by existing requirement: opencode-hub-and-obsidian-flow)

## Related Decisions

- **OMC Knowledge Architecture** (`docs/specs/2025-04-12-omc-knowledge-architecture.md`) — Defines the complete data model, file organization, and relationship types for all content types
- **OpenCode Hub and Obsidian Flow** (`docs/ai/requirements/opencode-hub-and-obsidian-flow.md`) — Defines the existing sidebar structure, knowledge extraction, and graph view requirements
- The application is currently read-only — this requirement introduces the first write capability from an AI agent
- The vault uses filesystem-as-database pattern — the skill writes markdown files directly to disk, relying on the existing file watcher for re-indexing
- Topic types are predefined: `article`, `blog`, `research-note`, `tutorial`, `reference`, `meeting-note`, `idea` — no custom types supported

---

## Architecture Decision Record (ADR)

**Status:** Proposed
**Date:** 2026-04-14
**Context:** The AKL's Knowledge dashboard is a read-only visualization of AI agent session data stored as markdown files. Users need the ability to create new knowledge content (topics) conversationally, with proper YAML frontmatter, draft-first workflow, and automatic dashboard integration via the existing file watcher.

**Decision:**

1. **Create a Knowledge Creator Agent** (`mode: "primary"`, `temperature: 0.6`) defined in both `opencode.jsonc` (runtime config) and `vault/agents/knowledge-creator.md` (documentation). The agent provides a conversational interface for creating and updating topic content.

2. **Create a Vault Writer Skill** defined in both `vault/skills/vault-writer.md` (documentation) and `~/.config/opencode/skills/vault-writer/SKILL.md` (executable workflow). The skill enforces proper markdown formatting, YAML frontmatter generation, slug/ID uniqueness, and path constraints.

3. **Direct filesystem writes** to `/Users/khoi.le/akl-knowledge/topics/`. The existing chokidar file watcher detects changes and rebuilds the Fuse.js search index with 1s debounce.

4. **Draft-first workflow**: New content defaults to `status: "draft"`. Explicit publish action required to change to `status: "published"`.

5. **Topics-only scope**: The agent can only create/update files under `topics/`. No access to `sessions/`, `agents/`, `skills/`, or `configs/`.

6. **Add `updatedAt` field** to `TopicFrontmatter` schema (`server/types/index.ts`).

7. **Create `blog/` category** directory under `topics/` to match the existing `'blog'` TopicType.

8. **Dashboard UX**: Add draft indicator (badge/filter) to topic list.

**Consequences:**

- New topics appear in the dashboard automatically via file watcher (no server restart needed)
- Draft content is visible alongside published content (dashboard UX distinguishes them)
- Slug collisions are prevented by the Vault Writer Skill's pre-write check
- The agent cannot corrupt infrastructure files (agents, skills, configs) due to path constraints
- Schema change requires updating existing topic files to include `updatedAt` (can be done lazily)
- One new directory (`blog/`) added to vault structure

**Alternatives Considered:**

1. **Write API endpoint instead of direct filesystem writes** — Rejected. Would require adding write capabilities to a read-only server, introducing authentication, authorization, and input validation complexity. Direct writes leverage the existing file watcher and are simpler.

2. **Skill-only approach (no agent)** — Rejected. A skill alone provides workflow instructions but no conversational interface or LLM configuration. The agent is needed for user interaction.

3. **Agent-only approach (no skill)** — Rejected. Without a skill, the agent has no structured workflow for frontmatter generation, slug validation, or path constraints. The skill enforces consistency.

4. **`subagent` mode for the Knowledge Creator** — Rejected. Users need to interact with it directly. Primary mode allows direct invocation while still being callable by the orchestrator.

5. **Temperature 0.5** — Modified to 0.6. Aligns better with creative content generation while staying below the designer's 0.7.

6. **Reuse existing category for blog posts** — Rejected. The `TopicType` enum already includes `'blog'`. A matching `blog/` category directory maintains consistency between type and storage location.
