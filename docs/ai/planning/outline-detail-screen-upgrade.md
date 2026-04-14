# Plan: Interactive Outline Upgrade for Detail Screens

**Date:** 2026-04-14
**Status:** In Progress
**Author:** Fixer
**Related Design:** `docs/ai/design/outline-detail-screen-upgrade.md`
**Related Requirement:** `docs/ai/requirements/outline-detail-screen-upgrade.md`

---

## Implementation Overview

**Total Tasks:** 11
**Estimated Effort:** 2-3 days
**Risk Level:** Medium (IntersectionObserver, scroll coordination)

---

## Phase 1: Foundation (Tasks 1-3)

### Task 1: Create `headingUtils.ts` Utility

**Files to Create:**
- `src/utils/headingUtils.ts`
- `src/utils/headingUtils.test.ts`

**Acceptance Criteria:**
- [ ] `extractHeadings(markdown: string)` extracts H1-H6 headings with regex `/^(#{1,6})\s+(.+)$/gm`
- [ ] `generateSlug(text, level, index, counts)` produces URL-safe slugs
- [ ] Duplicate heading texts get numeric suffixes (`intro`, `intro-1`, `intro-2`)
- [ ] Empty/special-char-only headings get fallback IDs (`heading-h{level}-{index}`)
- [ ] Returns `HeadingItem[]` with `{ id, level, text }`

**Design Reference:** Section 2.2

---

### Task 2: Create `useScrollSpy` Hook

**Files to Create:**
- `src/hooks/useScrollSpy.ts`
- `src/hooks/useScrollSpy.test.ts`

**Acceptance Criteria:**
- [ ] Uses `IntersectionObserver` with root margin targeting top 10% of container
- [ ] Throttles updates to max 10/sec (100ms minimum interval)
- [ ] Returns active heading ID or `null` when no heading is above viewport midpoint
- [ ] Cleans up observer on unmount
- [ ] Handles missing container gracefully

**Design Reference:** Section 2.3

---

### Task 3: Enhance `MarkdownRenderer` with Heading ID Injection

**Files to Modify:**
- `src/components/shared/MarkdownRenderer.tsx`
- `src/components/shared/MarkdownRenderer.test.tsx`

**Changes:**
- Add optional `headingIds?: Map<string, string>` prop
- Post-render DOM injection via `useEffect` that assigns IDs to heading elements
- Handle edge case where heading text doesn't match (fallback to generated ID)

**Design Reference:** Section 2.4

---

## Phase 2: Component (Tasks 4-5)

### Task 4: Create `ArticleOutline` Component

**Files to Create:**
- `src/components/shared/ArticleOutline.tsx`
- `src/components/shared/ArticleOutline.test.tsx`

**Acceptance Criteria:**
- [ ] Props: `headings`, `activeHeadingId`, `onHeadingClick`
- [ ] Internal state: `isCollapsed` with sessionStorage persistence
- [ ] Header row with toggle button (`segment` / `expand_more` icon swap)
- [ ] Collapse animation via CSS `max-height` transition (200ms ease-in-out)
- [ ] Heading list with correct indentation (`pl-4` through `pl-20`)
- [ ] Active heading highlight (`text-primary` + `border-l-2 border-primary-container`)
- [ ] Keyboard navigation (ArrowUp/Down, Enter/Space, Escape)
- [ ] Focus ring on focused items (`focus-visible:outline-2 focus-visible:outline-primary`)
- [ ] Monolithic Lexicon design tokens applied

**Design Reference:** Section 2.1

---

### Task 5: Test `ArticleOutline` Component in Isolation

**Files to Create:**
- `src/components/shared/ArticleOutline.stories.tsx` (optional, for visual testing)

**Test Scenarios:**
- [ ] Renders with empty headings array (shows nothing or "No headings")
- [ ] Renders with mixed-level headings (H1-H6)
- [ ] Collapse/expand toggle works
- [ ] Clicking heading calls `onHeadingClick`
- [ ] Active heading is highlighted
- [ ] Keyboard navigation cycles through items
- [ ] Escape collapses and returns focus to toggle
- [ ] SessionStorage persistence works across remounts

---

## Phase 3: Integration (Tasks 6-9)

### Task 6: Update `TopicDetailPage.tsx`

**Files to Modify:**
- `src/routes/TopicDetailPage.tsx`

**Changes:**
- Import `ArticleOutline`, `extractHeadings`, `useScrollSpy`
- Replace inline outline section with `<ArticleOutline />`
- Add content container ref for scroll spy
- Wire up `onHeadingClick` with scroll-to-heading logic
- Pass `activeHeadingId` from `useScrollSpy`
- Pass `headingIds` to `MarkdownRenderer`

**Design Reference:** Section 3

**Status:** ✅ Complete

---

### Task 7: Update `SessionDetailPage.tsx`

**Files to Modify:**
- `src/routes/SessionDetailPage.tsx`

**Changes:**
- Same as Task 6 — mirror the TopicDetailPage implementation

---

### Task 8: Add Outline to `AgentDetailPage.tsx`

**Files to Modify:**
- `src/routes/AgentDetailPage.tsx`

**Changes:**
- Add outline section to right metadata rail
- Import and use `ArticleOutline` component
- Extract headings from markdown body
- Add scroll container ref and scroll spy
- Wire up click-to-scroll

---

### Task 9: Add Outline to `SkillDetailPage.tsx`

**Files to Modify:**
- `src/routes/SkillDetailPage.tsx`

**Changes:**
- Same as Task 8 — mirror the AgentDetailPage implementation

---

## Phase 4: Verification (Tasks 10-11)

### Task 10: End-to-End Testing

**Test Scenarios:**
- [ ] Click outline item → scrolls to heading with smooth animation
- [ ] Scroll content → active heading updates in outline (max 10/sec)
- [ ] Collapse toggle → outline hides/shows with animation
- [ ] Keyboard navigation → Arrow keys move focus, Enter activates
- [ ] Session persistence → collapse state survives page navigation
- [ ] Special character headings → scroll still works (URL-safe IDs)
- [ ] Duplicate headings → each has unique ID
- [ ] No headings → outline section not rendered
- [ ] Long heading text → truncated with ellipsis, full text on hover

**Pages to Test:**
- TopicDetailPage
- SessionDetailPage
- AgentDetailPage
- SkillDetailPage

---

### Task 11: Regression Testing

**Verify No Breaking Changes:**
- [ ] Markdown rendering still works correctly
- [ ] Existing detail page functionality unchanged
- [ ] No console errors or warnings
- [ ] No performance degradation (check DevTools Performance tab)
- [ ] No visual regressions in other UI components
- [ ] Editor `OutlinePanel.tsx` still works (unchanged)

---

## Task Status Summary

| Task | Status | Started | Completed | Notes |
|------|--------|---------|-----------|-------|
| 1. Create headingUtils.ts | ✅ Complete | 2026-04-14 | 2026-04-14 | Foundation - 10 tests passing |
| 2. Create useScrollSpy hook | ✅ Complete | 2026-04-14 | 2026-04-14 | Foundation - 6 tests passing |
| 3. Enhance MarkdownRenderer | ✅ Complete | 2026-04-14 | 2026-04-14 | Foundation - 5 tests passing |
| 4. Create ArticleOutline component | ✅ Complete | 2026-04-14 | 2026-04-14 | Component - 13 tests passing |
| 5. Test ArticleOutline in isolation | ✅ Complete | 2026-04-14 | 2026-04-14 | Component - covered by Task 4 |
| 6. Update TopicDetailPage | ✅ Complete | 2026-04-14 | 2026-04-14 | Integration - TypeScript clean |
| 7. Update SessionDetailPage | ⏳ Pending | — | — | Integration |
| 8. Add outline to AgentDetailPage | ⏳ Pending | — | — | Integration |
| 9. Add outline to SkillDetailPage | ⏳ Pending | — | — | Integration |
| 10. End-to-end testing | ⏳ Pending | — | — | Verification |
| 11. Regression testing | ⏳ Pending | — | — | Verification |

---

## Dependencies

```
Task 1 (headingUtils) ─┬─> Task 3 (MarkdownRenderer)
                       └─> Task 4 (ArticleOutline) ─> Task 5 (Component Test)
                                                    ─> Task 6 (TopicDetailPage) ─┐
Task 2 (useScrollSpy) ──────────────────────────────> Task 7 (SessionDetailPage) ─┤
                                                                                  ├─> Task 10 (E2E)
Task 3 (MarkdownRenderer) ──────────────────────────> Task 8 (AgentDetailPage) ───┤   ─> Task 11 (Regression)
                                                                                  │
Task 4 (ArticleOutline) ────────────────────────────> Task 9 (SkillDetailPage) ───┘
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| IntersectionObserver browser support | Graceful degradation — active tracking simply doesn't work on unsupported browsers |
| Scroll coordination issues | Use `offsetTop` calculation instead of `scrollIntoView` for precise control |
| Performance degradation from re-renders | Throttle scroll spy to 100ms, use `useMemo` for heading extraction |
| sessionStorage unavailable | Try/catch around storage operations, default to expanded state |

---

## Definition of Done

- [ ] All 11 tasks completed
- [ ] All tests passing (unit + integration + E2E)
- [ ] No lint errors
- [ ] No console errors or warnings
- [ ] All 41 acceptance criteria verified
- [ ] Design document updated with any implementation deviations
- [ ] Code reviewed and approved
