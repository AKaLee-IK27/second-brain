# Design: Knowledge Creator Agent & Vault Writer Skill

**Date:** 2026-04-14
**Status:** Approved (2026-04-14)
**Author:** Orchestrator (with Researcher + Oracle input)
**Approved by:** Requirements reviewed & approved, all 30 ACs mapped to design sections
**Related Requirement:** `docs/ai/requirements/ai-knowledge-creator-agent.md`

---

## 1. Overview

This design adds a conversational content creation capability to the AKL's Knowledge system. Users chat with a specialized **Knowledge Creator Agent** that uses the **Vault Writer Skill** to generate properly-formatted markdown topics with YAML frontmatter and write them directly to the vault's `topics/` directory. The existing file watcher detects new files and triggers automatic re-indexing.

### Scope
- Create Knowledge Creator Agent (opencode runtime config + vault documentation)
- Create Vault Writer Skill (executable SKILL.md + vault documentation)
- Add `updatedAt` field to `TopicFrontmatter` schema
- Create `blog/` category directory under `topics/`
- Add draft indicator UI to dashboard topic list

### Out of Scope
- Write API endpoints (direct filesystem writes only)
- Content deletion capability
- Modification of sessions, agents, skills, or configs
- External publishing or CMS integration

---

## 2. Architecture

```mermaid
graph TB
    subgraph "User Interface"
        USER[User Terminal<br/>opencode CLI]
    end

    subgraph "OpenCode Runtime"
        KC[Knowledge Creator Agent<br/>mode: primary, temp: 0.6]
        VW[Vault Writer Skill<br/>SKILL.md]
        MEM[Memory Skill<br/>style preferences]
        SC[Shared Context<br/>existing content]
    end

    subgraph "Vault Writer Workflow"
        OUTLINE[Outline Generation]
        DRAFT[Draft Creation<br/>status: draft]
        VALIDATE[Frontmatter Validation]
        SLUG[Slug Uniqueness Check]
        WRITE[File Write<br/>topics/{category}/{slug}.md]
    end

    subgraph "Vault Filesystem"
        TOPICS[topics/<br/>documentation/<br/>tutorial/<br/>reference/<br/>technology/<br/>blog/]
    end

    subgraph "Server (Read-Only)"
        FW[File Watcher<br/>chokidar]
        SI[Search Index<br/>Fuse.js]
        WS[WebSocket<br/>/ws/files]
        API[REST API<br/>GET /api/topics]
    end

    subgraph "Dashboard UI"
        REACT[React App]
        TOPICLIST[TopicsPage.tsx]
        DRAFTBADGE[Draft Indicator<br/>Badge/Filter]
    end

    USER -->|chat| KC
    KC -->|load| VW
    KC -->|load| MEM
    KC -->|load| SC
    KC -->|1. clarify| OUTLINE
    OUTLINE -->|2. approve| DRAFT
    DRAFT -->|3. review| VALIDATE
    VALIDATE -->|4. check| SLUG
    SLUG -->|5. write| WRITE
    WRITE -->|save| TOPICS
    TOPICS -->|detect| FW
    FW -->|rebuild| SI
    FW -->|broadcast| WS
    WS -->|real-time| REACT
    API -->|fetch| REACT
    REACT -->|render| TOPICLIST
    TOPICLIST -->|show| DRAFTBADGE

    style KC fill:#8b5cf6,color:#fff
    style VW fill:#16213e,color:#e6edf3
    style WRITE fill:#0f3460,color:#e6edf3
    style FW fill:#1a1a2e,color:#e6edf3
    style DRAFTBADGE fill:#f59e0b,color:#000
```

---

## 3. Component Design

### 3.1 Knowledge Creator Agent

**Location:** `~/.config/opencode/opencode.jsonc` (runtime) + `vault/agents/knowledge-creator.md` (documentation)

```jsonc
"knowledge-creator": {
  "model": "alibaba-coding-plan/qwen3.6-plus",
  "temperature": 0.6,
  "mode": "primary",
  "color": "#8b5cf6",
  "steps": 25,
  "description": "Conversational content creation specialist. Creates blog posts, research notes, tutorials, and documentation through dialogue.",
  "prompt": "...",
  "permission": {
    "read": "allow",
    "write": "allow",
    "edit": "allow",
    "glob": "allow",
    "grep": "allow",
    "bash": "ask"
  }
}
```

**System Prompt Structure:**
```
You are Knowledge Creator — a conversational content creation specialist.

RELATED SKILLS:
- vault-writer: For writing content with proper frontmatter and structure
- memory: For storing content preferences and style guidelines
- shared-context: Load context for existing content and style decisions

MANDATORY WORKFLOW:
1. Clarify topic, type, audience, and scope
2. Present outline for approval
3. Draft content with status: draft
4. Present for review
5. Publish after explicit approval

HARD-GATES:
- No content without approved outline
- No publish without user approval
- All files must have valid frontmatter
- Only write to topics/ directory
```

**Vault Documentation Entry** (`vault/agents/knowledge-creator.md`):
```yaml
---
id: "agent_knowledge_creator"
name: "Knowledge Creator"
slug: "knowledge-creator"
emoji: "✍️"
type: "specialist"
tier: "specialist"
status: "active"
model: "qwen3.6-plus"
shortDescription: "Conversational content creation specialist for blog posts, research notes, and tutorials"
whenToUse: "Use for creating blog posts, research notes, tutorials, and documentation through conversation."
version: 1
---
```

### 3.2 Vault Writer Skill

**Location:** `~/.config/opencode/skills/vault-writer/SKILL.md` (executable) + `vault/skills/vault-writer.md` (documentation)

**Directory Structure:**
```
~/.config/opencode/skills/vault-writer/
├── SKILL.md                    # Main skill definition
└── templates/
    ├── blog.md
    ├── research-note.md
    ├── tutorial.md
    ├── reference.md
    └── article.md
```

**SKILL.md Core Structure:**
```markdown
---
name: vault-writer
description: Use for writing content to the knowledge vault with proper frontmatter and structure
---

# Vault Writer: Knowledge Vault Content Specialist

<HARD-GATE>
Do NOT write content without: (1) frontmatter with all required fields,
(2) unique slug verified against existing topics, (3) valid category
matching a topics/ subdirectory, (4) user approval of draft.
</HARD-GATE>

## Core Workflow

1. READ existing topics in target category (slug collision check)
2. GENERATE frontmatter with all required fields
3. VALIDATE frontmatter completeness
4. WRITE file to topics/{category}/{slug}.md
5. CONFIRM write success

## Frontmatter Schema

Required: id, slug, title, type, category, status, createdAt, updatedAt, version
Optional: summary, readTime, tags, author, relatedTopics, sourceSession

## Slug Generation

1. Lowercase title, replace spaces with hyphens
2. Remove special characters
3. Check existing slugs in target category
4. If collision: append -2, -3, etc.

## Content Templates

### Blog
Structure: Introduction → Body Sections → Conclusion → Tags

### Research Note
Structure: Summary → Key Findings → Sources → Notes

### Tutorial
Structure: Prerequisites → Steps → Summary

### Reference
Structure: Overview → Sections → Examples

### Article
Structure: Introduction → Sections → Conclusion
```

### 3.3 TopicFrontmatter Schema Update

**File:** `server/types/index.ts`

**Change:** Add `updatedAt?: string` to `TopicFrontmatter`:

```typescript
export interface TopicFrontmatter {
  id: string;
  slug: string;
  title: string;
  type: TopicType;
  category: string;
  status: TopicStatus;
  summary?: string;
  createdAt: string;
  updatedAt?: string;        // NEW: ISO 8601 timestamp for last modification
  readTime?: number;
  tags?: string[];
  author?: string;
  relatedTopics?: string[];
  sourceSession?: string;
  version: number;
}
```

### 3.4 Blog Category Directory

**Action:** Create `topics/blog/` directory in vault at `/Users/khoi.le/akl-knowledge/topics/blog/`

This matches the existing `'blog'` TopicType value and maintains consistency between type and storage location.

### 3.5 Dashboard Draft Indicator

**File:** `src/routes/TopicsPage.tsx` (or equivalent component)

**Changes:**
1. Add visual draft badge next to topic title when `status === 'draft'`
2. Add filter toggle to show/hide draft topics
3. Optional: reduced opacity for draft items

**Component Design:**
```tsx
// Draft badge component
const DraftBadge = () => (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
    Draft
  </span>
);

// Filter toggle in topic list header
const DraftFilter = ({ showDrafts, onToggle }) => (
  <label className="flex items-center gap-2 text-sm">
    <input type="checkbox" checked={showDrafts} onChange={onToggle} />
    Show drafts
  </label>
);
```

---

## 4. Data Flow

### 4.1 Content Creation Flow

```
User: "Write a blog post about Flutter BLoC pattern"
  │
  ▼
Knowledge Creator Agent
  │
  ├─ 1. Clarify: type=blog, category=technology or blog?, audience=developers?
  │
  ├─ 2. Outline: Present structure for approval
  │     - Introduction to BLoC
  │     - Core Concepts
  │     - Implementation Example
  │     - Best Practices
  │     - Conclusion
  │
  ├─ 3. Draft: Generate full markdown content
  │     - Frontmatter: status=draft, type=blog, category=blog
  │     - Body: Complete article content
  │
  ├─ 4. Review: Present draft to user
  │     User: "Add a section about testing"
  │     Agent: Updates draft with testing section
  │
  ├─ 5. Validate: Check frontmatter completeness
  │     - id: topic_flutter_bloc_pattern
  │     - slug: flutter-bloc-pattern (check uniqueness)
  │     - All required fields present ✓
  │
  ├─ 6. Write: Save to vault/topics/blog/flutter-bloc-pattern.md
  │
  ▼
File Watcher (chokidar)
  │
  ├─ Detects new file
  ├─ Debounces 1s
  ├─ Rebuilds Fuse.js search index
  ├─ Broadcasts via WebSocket
  │
  ▼
Dashboard UI
  │
  ├─ Receives WebSocket event
  ├─ Fetches updated topic list
  ├─ Renders new topic with "Draft" badge
  │
  ▼
User: "Publish it"
  │
  ▼
Knowledge Creator Agent
  │
  ├─ Updates frontmatter: status=published, updatedAt=now
  ├─ Writes updated file
  │
  ▼
File Watcher → Index Rebuild → UI Update
```

### 4.2 Slug Collision Resolution

```
Agent generates slug: "flutter-state-management"
  │
  ▼
Read existing topics in target category
  │
  ├─ No collision → use slug as-is
  │
  └─ Collision detected
       │
       ▼
       Append numeric suffix: "flutter-state-management-2"
       │
       ▼
       Re-check → if still collision, increment: "-3", "-4", etc.
       │
       ▼
       Inform user: "A topic with this slug already exists. Using 'flutter-state-management-2' instead."
```

---

## 5. Error Handling Strategy

| Error Scenario | Handling | User Message |
|----------------|----------|--------------|
| Invalid frontmatter | Validate before write, reject | "Frontmatter validation failed: missing required field 'title'" |
| Slug collision | Auto-append suffix, inform user | "Slug exists, using 'slug-2' instead" |
| Write permission denied | Retry once, then fail | "Cannot write to vault. Check permissions." |
| Invalid category | Reject, list valid categories | "Invalid category. Valid: documentation, tutorial, reference, technology, blog" |
| File watcher not running | Write succeeds, manual refresh needed | "File written. Refresh dashboard to see changes." |
| Empty content body | Reject before write | "Content body is empty. Please provide content." |
| Network/API call for sources | Reject fabricated references | "I cannot verify this source. Please provide a valid reference." |

---

## 6. Security Considerations

| Concern | Mitigation |
|---------|------------|
| Path traversal | Vault Writer Skill validates path starts with `topics/` |
| Overwriting infrastructure files | Agent permissions restricted to `topics/**` only |
| Malicious content | User review gate before publish; draft-first workflow |
| Frontmatter injection | Validate all frontmatter fields against schema before write |
| Shell command execution | `bash: "ask"` permission requires user confirmation |

---

## 7. Performance Implications

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| Content generation | < 30s | For topics up to 2000 words |
| File write | < 2s | Direct filesystem write |
| File watcher detection | ~1s | 500ms stability threshold + debounce |
| Search index rebuild | < 500ms | Fuse.js incremental update |
| Dashboard update | < 200ms | WebSocket event + API fetch |

**No performance degradation expected** — the file watcher already handles all content types and debounces index rebuilds.

---

## 8. Implementation Plan

### Phase 1: Schema & Infrastructure (Day 1)
1. Add `updatedAt?: string` to `TopicFrontmatter` in `server/types/index.ts`
2. Create `topics/blog/` directory in vault
3. Update topic route to handle `updatedAt` field

### Phase 2: Agent Definition (Day 1-2)
1. Add `knowledge-creator` agent to `~/.config/opencode/opencode.jsonc`
2. Create `vault/agents/knowledge-creator.md` documentation
3. Test agent invocation and permissions

### Phase 3: Skill Definition (Day 2-3)
1. Create `~/.config/opencode/skills/vault-writer/SKILL.md`
2. Create content templates in `templates/` directory
3. Create `vault/skills/vault-writer.md` documentation
4. Test skill loading and workflow execution

### Phase 4: Dashboard UX (Day 3-4)
1. Add draft badge component to topic list
2. Add draft filter toggle
3. Test real-time updates via WebSocket

### Phase 5: Integration Testing (Day 4-5)
1. End-to-end test: create → draft → review → publish workflow
2. Test slug collision handling
3. Test frontmatter validation
4. Test file watcher integration

---

## 9. Testing Strategy

| Test Type | What | How |
|-----------|------|-----|
| Unit | Frontmatter validation | Test all required/optional field combinations |
| Unit | Slug generation | Test collision detection and suffix appending |
| Unit | Category validation | Test valid/invalid category rejection |
| Integration | File write → watcher → index | Write file, verify index update |
| Integration | Agent → skill → vault | Full content creation workflow |
| E2E | Dashboard draft indicator | Create draft, verify badge appears |
| E2E | Publish workflow | Draft → publish → verify status change |

---

## 10. Acceptance Criteria Mapping

| Requirement AC | Design Section | Status |
|----------------|----------------|--------|
| Agent definition (slug, type, tier, status) | §3.1 | ✅ Covered |
| Agent mode: primary | §3.1 | ✅ Covered |
| Agent temperature: 0.6 | §3.1 | ✅ Covered |
| Skill definition (slug, category, status) | §3.2 | ✅ Covered |
| Required frontmatter fields | §3.2, §3.3 | ✅ Covered |
| updatedAt field | §3.3 | ✅ Covered |
| Slug generation + collision check | §3.2, §4.2 | ✅ Covered |
| Draft-first workflow | §4.1 | ✅ Covered |
| Topics-only scope | §3.1 (HARD-GATE) | ✅ Covered |
| Blog category directory | §3.4 | ✅ Covered |
| Draft indicator UI | §3.5 | ✅ Covered |
| Error handling | §5 | ✅ Covered |
| Security (path traversal, permissions) | §6 | ✅ Covered |
| Performance targets | §7 | ✅ Covered |
