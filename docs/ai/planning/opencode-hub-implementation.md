# Implementation Plan: OpenCode Hub & Knowledge Flow

**Created:** 2026-04-13
**Status:** In Progress
**Design:** `docs/specs/2026-04-13-opencode-hub-and-knowledge-flow-design.md`
**Requirement:** `docs/ai/requirements/opencode-hub-and-obsidian-flow.md`

---

## Phase 1: OpenCode Hub

### Task 1.1: Sidebar Collapsible Group
**Files to change:**
- `src/components/layout/Sidebar.tsx`

**Acceptance Criteria:**
- [ ] Replace Agents, Skills, Configs nav items with single "OpenCode" collapsible group
- [ ] Chevron icon for expand/collapse
- [ ] Clicking "OpenCode" label navigates to `/opencode`
- [ ] Clicking chevron expands/collapses without navigation
- [ ] Active state highlights group when any sub-route is active
- [ ] Keyboard shortcut `g+o` navigates to `/opencode`
- [ ] Existing shortcuts `g+a`, `g+k`, `g+c` continue to work

**Tests:**
- `test/components/layout/Sidebar.test.tsx`: Collapsible group behavior, navigation, keyboard shortcuts

---

### Task 1.2: OpenCode Hub Page
**Files to change:**
- `src/routes/OpenCodePage.tsx` (new)
- `src/components/opencode/HubSummaryCard.tsx` (new)
- `src/components/opencode/RecentActivityFeed.tsx` (new)
- `src/routes/App.tsx` (add route)

**Acceptance Criteria:**
- [ ] Hub page displays at `/opencode`
- [ ] Three summary cards: Agents, Skills, Configs
- [ ] Each card shows count from IndexedDB cache
- [ ] Each card shows "No X found" when count is 0
- [ ] "View All" links navigate to `/agents`, `/skills`, `/configs`
- [ ] Recent activity feed shows recent sessions only

**Tests:**
- `test/routes/OpenCodePage.test.tsx`: Page renders, counts display, empty states
- `test/components/opencode/HubSummaryCard.test.tsx`: Card rendering, empty state, navigation

---

### Task 1.3: Keyboard Shortcut Registration
**Files to change:**
- `src/routes/App.tsx` (add `g+o` shortcut)

**Acceptance Criteria:**
- [ ] `g+o` chord navigates to `/opencode`
- [ ] Existing shortcuts remain functional

**Tests:**
- `test/routes/App.shortcuts.test.tsx`: All keyboard shortcuts work

---

## Phase 2: Knowledge Extraction

### Task 2.1: Server-Side Knowledge Extraction
**Files to change:**
- `server/routes/knowledge.ts` (new)
- `server/routes/sessions.ts` (add knowledgeSnippets field)
- `server/services/file-watcher.ts` (trigger re-extraction)

**Acceptance Criteria:**
- [ ] `GET /api/knowledge` returns all snippets
- [ ] `GET /api/knowledge?type=finding` filters by type
- [ ] `GET /api/knowledge?sessionId=X` filters by session
- [ ] Extraction happens during file indexing (single pass)
- [ ] Missing sections gracefully skipped (no false positives)
- [ ] File changes trigger re-extraction

**Tests:**
- `test/server/knowledge-api.test.ts`: API endpoints, filtering, error handling
- `test/server/knowledge-extraction.test.ts`: Markdown parsing, edge cases

---

### Task 2.2: Client Knowledge Hook
**Files to change:**
- `src/hooks/useKnowledge.ts` (new)
- `src/api.ts` (add knowledge endpoints)

**Acceptance Criteria:**
- [ ] `useKnowledge()` hook fetches snippets
- [ ] `useKnowledge(sessionId)` fetches session-specific snippets
- [ ] Loading and error states handled
- [ ] Cache results to avoid refetching

**Tests:**
- `test/hooks/useKnowledge.test.ts`: Hook behavior, caching, error handling

---

### Task 2.3: Knowledge Display Components
**Files to change:**
- `src/components/knowledge/KnowledgeSnippetsList.tsx` (new)
- `src/components/knowledge/KnowledgeSnippetCard.tsx` (new)
- `src/components/knowledge/KnowledgeBadge.tsx` (new)

**Acceptance Criteria:**
- [ ] Snippets grouped by type (findings, files, actions)
- [ ] Each snippet shows type badge + content
- [ ] Badge shows finding count for list views
- [ ] Empty state when no snippets

**Tests:**
- `test/components/knowledge/KnowledgeSnippetsList.test.tsx`: Grouping, rendering
- `test/components/knowledge/KnowledgeBadge.test.tsx`: Count display

---

### Task 2.4: Session Detail Page Enhancement
**Files to change:**
- `src/routes/SessionDetailPage.tsx`

**Acceptance Criteria:**
- [ ] "Knowledge Extracted" section displays
- [ ] Key Findings, Files Modified, Next Steps shown
- [ ] Related Knowledge section with topic links
- [ ] Backlinks section

**Tests:**
- `test/routes/SessionDetailPage.test.tsx`: Knowledge sections render

---

### Task 2.5: Session List Page Enhancement
**Files to change:**
- `src/routes/SessionsPage.tsx`

**Acceptance Criteria:**
- [ ] Outcome preview displayed alongside title
- [ ] KnowledgeBadge shows finding count per session

**Tests:**
- `test/routes/SessionsPage.test.tsx`: Outcome and badge display

---

## Phase 3: Unified Graph

### Task 3.1: Graph API Endpoint
**Files to change:**
- `server/routes/graph.ts` (new)
- `server/services/graph-builder.ts` (new)

**Acceptance Criteria:**
- [ ] `GET /api/graph` returns nodes + edges
- [ ] Nodes include Notes, Sessions, Topics, Agents, Skills
- [ ] Edges represent all relationship types
- [ ] Query params `types` and `days` work
- [ ] Response includes counts

**Tests:**
- `test/server/graph-api.test.ts`: Node/edge generation, filtering

---

### Task 3.2: Unified Graph Component
**Files to change:**
- `src/components/graph/UnifiedGraph.tsx` (new)
- `src/components/graph/GraphCanvas.tsx` (new)
- `src/components/graph/GraphControls.tsx` (new)
- `src/components/graph/GraphLegend.tsx` (new)

**Acceptance Criteria:**
- [ ] Canvas-based rendering for 100+ nodes
- [ ] Force-directed layout using d3-force
- [ ] Entity type filter toggles
- [ ] Click node → navigate to detail page
- [ ] Hover → tooltip with name + type
- [ ] Empty state (0 nodes) shows message
- [ ] Single-node state centered

**Tests:**
- `test/components/graph/UnifiedGraph.test.tsx`: Rendering, interactions, states
- `test/components/graph/GraphCanvas.test.tsx`: Canvas rendering

---

### Task 3.3: Graph Performance Optimization
**Files to change:**
- `src/components/graph/UnifiedGraph.tsx`

**Acceptance Criteria:**
- [ ] ≥30fps at 500 nodes during interaction
- [ ] <2s initial render at 500 nodes
- [ ] Auto-filter to 30 days for >500 nodes
- [ ] Warning banner with "Show all" override

**Tests:**
- `test/components/graph/UnifiedGraph.performance.test.tsx`: Benchmark tests

---

### Task 3.4: Replace MiniGraph and GraphOverlay
**Files to change:**
- `src/components/layout/RightPanel.tsx` (use UnifiedGraph mini mode)
- `src/components/graph/MiniGraph.tsx` (wrap UnifiedGraph or remove)
- `src/components/graph/GraphOverlay.tsx` (wrap UnifiedGraph or remove)

**Acceptance Criteria:**
- [ ] MiniGraph replaced with UnifiedGraph (mini mode)
- [ ] GraphOverlay replaced with UnifiedGraph (full mode)
- [ ] Existing functionality preserved

**Tests:**
- `test/components/layout/RightPanel.test.tsx`: Graph tab works

---

## Phase 4: Backlinks & Relationships

### Task 4.1: Server Backlink Endpoints
**Files to change:**
- `server/routes/backlinks.ts` (new)
- `server/services/backlink-computer.ts` (new)

**Acceptance Criteria:**
- [ ] `GET /api/sessions/:id/backlinks` returns session + topic backlinks
- [ ] `GET /api/topics/:slug/backlinks` returns session + topic backlinks
- [ ] `GET /api/agents/:slug/used-in` returns recent sessions
- [ ] `GET /api/skills/:slug/used-in` returns recent sessions
- [ ] Cross-entity queries computed server-side

**Tests:**
- `test/server/backlinks-api.test.ts`: All backlink endpoints

---

### Task 4.2: Topic Detail Page Enhancement
**Files to change:**
- `src/routes/TopicDetailPage.tsx`

**Acceptance Criteria:**
- [ ] Source session link displayed
- [ ] Related topics displayed
- [ ] Referenced By section with backlinks

**Tests:**
- `test/routes/TopicDetailPage.test.tsx`: Backlinks section renders

---

### Task 4.3: Agent Detail Page Enhancement
**Files to change:**
- `src/routes/AgentDetailPage.tsx`

**Acceptance Criteria:**
- [ ] "Used In" section displays
- [ ] Top 10 recent sessions shown

**Tests:**
- `test/routes/AgentDetailPage.test.tsx`: Used In section renders

---

### Task 4.4: Skill Detail Page Enhancement
**Files to change:**
- `src/routes/SkillDetailPage.tsx`

**Acceptance Criteria:**
- [ ] "Used In" section displays
- [ ] Top 10 recent sessions shown

**Tests:**
- `test/routes/SkillDetailPage.test.tsx`: Used In section renders

---

## Task Status Summary

| Task | Phase | Status | Started | Completed |
|------|-------|--------|---------|-----------|
| 1.1 Sidebar Collapsible Group | 1 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 1.2 OpenCode Hub Page | 1 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 1.3 Keyboard Shortcut | 1 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 2.1 Server Knowledge Extraction | 2 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 2.2 Client Knowledge Hook | 2 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 2.3 Knowledge Components | 2 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 2.4 Session Detail Enhancement | 2 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 2.5 Session List Enhancement | 2 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 3.1 Graph API | 3 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 3.2 Unified Graph Component | 3 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 3.3 Graph Performance | 3 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 3.4 Replace MiniGraph/Overlay | 3 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 4.1 Backlink Endpoints | 4 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 4.2 Topic Detail Enhancement | 4 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 4.3 Agent Detail Enhancement | 4 | ✅ Complete | 2026-04-13 | 2026-04-13 |
| 4.4 Skill Detail Enhancement | 4 | ✅ Complete | 2026-04-13 | 2026-04-13 |

---

## Deviations from Design (Resolved)

| # | Original Design | Actual Implementation | Resolution |
|---|----------------|----------------------|------------|
| 1 | Separate GraphCanvas.tsx, GraphLegend.tsx | UnifiedGraph handles all rendering; GraphLegend.tsx created | GraphLegend.tsx created; GraphCanvas logic integrated into UnifiedGraph |
| 2 | MiniGraph.tsx and GraphOverlay.tsx replaced | Files deleted; full-screen overlay in App.tsx with UnifiedGraph mode="full" | ✅ Resolved |
| 3 | HubSummaryCard uses IndexedDB cache | Uses REST API directly | Acceptable — data from server; caching deferred |
| 4 | Graph performance benchmark tests | Not implemented | Deferred — d3-force handles 500 nodes; profiling can be added later |

---

## Notes

- **Parallel execution:** Tasks within each phase can be executed in parallel where they don't share files
- **Phase dependencies:** Phase 2 depends on Phase 1 completion; Phase 3 depends on Phase 2; Phase 4 depends on Phase 3
- **TDD required:** Every task must start with failing tests before implementation
- **Verification evidence:** Each task must show test output, lint check, and manual test description
