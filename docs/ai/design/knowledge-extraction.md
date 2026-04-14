# Knowledge Extraction System

## Overview

The knowledge extraction system parses session markdown files to extract structured knowledge snippets from three specific sections: `## Key Findings`, `## Files Modified`, and `## Next Steps`. It transforms unstructured AI session output into queryable, filterable data that powers the dashboard's knowledge discovery features.

**Key principle:** Extraction happens during file indexing in a single pass — no separate indexing step is required.

## Architecture

```mermaid
graph TB
    subgraph "File System"
        MD[Session .md files]
    end

    subgraph "Server"
        FR[file-reader.ts]
        FP[frontmatter-parser.ts]
        KE[knowledge-extractor.ts]
        KR[knowledge.ts routes]
        CACHE[(In-memory cache)]
    end

    subgraph "Client"
        API[api.ts client]
        HOOK[useKnowledge hook]
        LIST[KnowledgeSnippetsList]
        CARD[KnowledgeSnippetCard]
        BADGE[KnowledgeBadge]
    end

    MD -->|listFiles| FR
    FR -->|raw content| FP
    FP -->|frontmatter + body| KE
    KE -->|KnowledgeSnippet[]| CACHE
    CACHE -->|serve| KR
    KR -->|JSON| API
    API -->|data| HOOK
    HOOK -->|snippets| LIST
    LIST -->|render| CARD
    LIST -->|count| BADGE
```

## Component Map

| Component | File | Role |
|-----------|------|------|
| **Extractor** | `server/services/knowledge-extractor.ts` | Core parsing logic, cache management |
| **API Routes** | `server/routes/knowledge.ts` | HTTP endpoints, request filtering |
| **API Client** | `src/services/api.ts` (lines 293-311) | Frontend API calls |
| **Type Definition** | `src/types/knowledge.ts` | Shared `KnowledgeSnippet` interface |
| **Hook** | `src/hooks/useKnowledge.ts` | React data fetching with loading/error state |
| **List Component** | `src/components/knowledge/KnowledgeSnippetsList.tsx` | Grouped snippet display |
| **Card Component** | `src/components/knowledge/KnowledgeSnippetCard.tsx` | Individual snippet rendering |
| **Badge Component** | `src/components/knowledge/KnowledgeBadge.tsx` | Finding count indicator |

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. FILE INDEXING TRIGGER                                           │
│     - App startup OR chokidar file watcher detects .md change       │
└──────────────────────────┬──────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. LOAD SESSIONS                                                   │
│     - listFiles('sessions', '.md') → array of file paths            │
│     - readFile(file) → raw markdown content                         │
└──────────────────────────┬──────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. PARSE MARKDOWN                                                  │
│     - parseMarkdown(content) → { frontmatter, body }                │
│     - Extract: id, slug, title, createdAt from frontmatter          │
└──────────────────────────┬──────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. EXTRACT KNOWLEDGE (single pass per session)                     │
│     - extractSections(body) → map of heading → content              │
│     - parseListItems(content) → array of list item strings          │
│     - Map sections to types:                                        │
│       "Key Findings"   → type: 'finding'                            │
│       "Files Modified" → type: 'file'                               │
│       "Next Steps"     → type: 'action'                             │
└──────────────────────────┬──────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. REBUILD CACHE                                                   │
│     - All snippets collected into in-memory cache                   │
│     - cache = { snippets: KnowledgeSnippet[], lastUpdated: number } │
└──────────────────────────┬──────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6. SERVE VIA API                                                   │
│     - GET /api/knowledge → all snippets + stats                     │
│     - GET /api/knowledge/stats → counts only                        │
│     - GET /api/knowledge/session/:id → session-specific snippets    │
│     - Query params: ?type=finding|file|action&sessionId=X           │
└──────────────────────────┬──────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  7. CLIENT DISPLAY                                                  │
│     - useKnowledge() hook fetches data                              │
│     - KnowledgeSnippetsList groups by type (finding → file → action)│
│     - KnowledgeSnippetCard renders each with type-colored badge     │
│     - KnowledgeBadge shows count in list views                      │
└─────────────────────────────────────────────────────────────────────┘
```

## API Reference

### `GET /api/knowledge`

Returns all extracted knowledge snippets with statistics.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `string` | Filter by snippet type: `finding`, `file`, or `action` |
| `sessionId` | `string` | Filter by parent session ID |

**Response Schema:**

```typescript
{
  success: true;
  data: {
    snippets: KnowledgeSnippet[];
    total: number;
    byType: {
      findings: number;
      files: number;
      actions: number;
    };
  };
  meta: {
    timestamp: string; // ISO 8601
  };
}
```

**KnowledgeSnippet Schema:**

```typescript
interface KnowledgeSnippet {
  id: string;           // Format: "{sessionId}-{type}-{index}"
  sessionId: string;    // Parent session ID
  sessionSlug: string;  // Parent session URL slug
  sessionTitle: string; // Parent session title
  type: 'finding' | 'file' | 'action';
  content: string;      // Extracted list item text
  sourceSection: string;// Original section name
  createdAt: number;    // Unix timestamp from session frontmatter
}
```

### `GET /api/knowledge/stats`

Returns knowledge statistics only (no snippets).

**Response Schema:**

```typescript
{
  success: true;
  data: {
    total: number;
    byType: {
      findings: number;
      files: number;
      actions: number;
    };
  };
  meta: {
    timestamp: string;
  };
}
```

### `GET /api/knowledge/session/:sessionId`

Returns knowledge snippets for a specific session.

**Response Schema:**

```typescript
{
  success: true;
  data: KnowledgeSnippet[];
  meta: {
    timestamp: string;
  };
}
```

## Extraction Patterns

### Section Detection

Sections are identified by level-2 markdown headings (`## Heading Name`):

```regex
/^## (.+)$/gm
```

The regex captures the heading text (everything after `## `) and uses the `g` and `m` flags to find all headings across multiple lines.

### Section Content Extraction

Content between headings is extracted by tracking start/end positions:

1. Each heading's start position = match index + heading text length
2. Each heading's end position = next heading's start position (or end of file)
3. Content = `body.slice(start, end).trim()`

### List Item Parsing

List items are extracted from section content line-by-line:

```regex
Lines starting with: "- " or "* "
```

**Supported formats:**
- `- item text`
- `* item text`

**Not supported:**
- Numbered lists (`1. item`)
- Nested lists (sub-items are treated as separate lines but won't match the `- ` or `* ` prefix after trimming)
- Checkbox lists (`- [ ] item`) — the `[ ]` becomes part of the content

**Processing:**
1. Split content by newline
2. Trim each line
3. If line starts with `- ` or `* `, extract text after the prefix
4. Skip empty items

### Type Mapping

| Section Heading | Snippet Type | ID Prefix |
|----------------|--------------|-----------|
| `Key Findings` | `finding` | `{sessionId}-finding-{index}` |
| `Files Modified` | `file` | `{sessionId}-file-{index}` |
| `Next Steps` | `action` | `{sessionId}-action-{index}` |

## Key Decisions and Patterns

### In-Memory Cache

The knowledge cache is a simple module-level variable:

```typescript
let cache: KnowledgeCache = { snippets: [], lastUpdated: 0 };
```

**Rationale:** The app is local-first and single-user. An in-memory cache avoids database complexity while providing fast reads. The cache is rebuilt on every API request to ensure freshness (the file system is the source of truth).

### Single-Pass Extraction

Knowledge extraction happens during the same pass that reads session files for the main session list. There is no separate "knowledge indexing" step.

**Rationale:** Reduces I/O overhead and ensures knowledge is always in sync with session content.

### ID Generation

Snippet IDs are deterministic: `{sessionId}-{type}-{index}`.

**Rationale:** Enables stable React keys and predictable referencing. The index is zero-based within each section.

### Cache Rebuild on Every Request

Unlike other caches that invalidate on file changes, the knowledge cache rebuilds on every API request.

**Rationale:** Simpler correctness guarantee — no cache invalidation bugs. The performance cost is acceptable for local-first usage with typical session counts (< 1000 files).

### Client-Side Stats Computation

The `useKnowledge` hook computes stats client-side from the fetched snippets, even though the API also returns stats.

**Rationale:** The hook may filter or transform snippets after fetching, so client-side stats reflect the actual displayed data.

## Gotchas

### 1. Heading Matching is Case-Sensitive

The section detection regex matches exact heading text. `## Key Findings` will be found, but `## key findings` or `## KEY FINDINGS` will not. The heading must match exactly as written in the code.

### 2. No Nested List Support

Only top-level list items (`- ` or `* `) are extracted. Nested items (indented with spaces/tabs) will not match because after trimming, they still start with `- ` or `* ` but are treated as separate items — however, the indentation is lost and context is unclear.

### 3. Empty Sections Produce No Snippets

If a section exists but contains no list items (only prose text), zero snippets are generated for that section. No error is thrown.

### 4. Cache Rebuilds on Every Request

Every call to `GET /api/knowledge` triggers a full file system scan and cache rebuild. For large data roots (1000+ sessions), this may add latency to the first request after a file change.

### 5. No Deduplication

If the same finding appears in multiple sessions, it will appear as separate snippets. There is no cross-session deduplication or merging.

### 6. Date Parsing Fallback

If `sessionCreatedAt` cannot be parsed as a valid date, `Date.now()` is used as a fallback:

```typescript
const createdAt = new Date(sessionCreatedAt).getTime() || Date.now();
```

### 7. Unreadable Files Are Silently Skipped

During cache rebuild, any file that throws during `readFile` is silently skipped. No error is logged or returned in the response.

## Related Documentation

- **Design Spec:** `docs/specs/2026-04-13-opencode-hub-and-knowledge-flow-design.md` — Original knowledge flow design
- **Requirements:** `docs/ai/requirements/opencode-hub-and-obsidian-flow.md` — Knowledge extraction requirements
- **Implementation Plan:** `docs/ai/planning/opencode-hub-implementation.md` — Implementation tasks and file list
- **Knowledge Architecture:** `docs/specs/2025-04-12-omc-knowledge-architecture.md` — Overall data model and file organization
- **Knowledge Creator Agent:** `docs/specs/2026-04-14-knowledge-creator-agent-design.md` — Agent for creating knowledge content
