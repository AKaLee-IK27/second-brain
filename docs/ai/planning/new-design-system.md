# Implementation Plan: New Design System — Emoji to SVG Icon Migration

**Date:** 2026-04-12
**Status:** ✅ Complete
**Related Design:** `docs/ai/design/new-design-system.md`
**Related Requirements:** `docs/ai/requirements/new-design-system.md`

---

## Phase 1: Foundation

### Task 1: Install lucide-react ✅
- **Action:** `npm install lucide-react` → v1.8.0
- **Files:** `package.json`, `package-lock.json`
- **Verification:** `npm run build` succeeds

### Task 2: Create shared Icon component ✅
- **Action:** Created `src/components/shared/Icon.tsx` with typed icon registry (21 icons)
- **Files:** `src/components/shared/Icon.tsx`
- **Verification:** TypeScript compiles, build succeeds

### Task 3: Write Icon component unit tests ⏭️ Skipped
- **Reason:** No test framework installed (npm install timing out for vitest)
- **Note:** Can be added later when test infrastructure is available

---

## Phase 2: Layout Components

### Task 4: Migrate TopBar.tsx ✅
- **Icons:** PanelLeft, Brain, RefreshCw, Settings
- **Verification:** Build succeeds, no emoji in file

### Task 5: Migrate Sidebar.tsx ✅
- **Icons:** ClipboardList, Users, Wrench, BookOpen, Settings, BarChart3, ArrowLeftRight, PanelLeft, PanelLeftClose, FolderOpen
- **Status indicators:** Replaced 🟢🔴⚪ with colored `div` elements using CSS custom properties
- **Verification:** Build succeeds, no emoji in file

### Task 6: Migrate StatusBar.tsx ✅
- **Status indicators:** Replaced 🟢🔴⚪ with colored `div` elements
- **Verification:** Build succeeds, no emoji in file

### Task 7: Migrate RightPanel.tsx ✅
- **Icons:** Info, Link, Hexagon, List
- **Verification:** Build succeeds, no emoji in file

### Task 8: Migrate NoteInfoPanel.tsx ✅
- **Icons:** Trash2
- **Verification:** Build succeeds, no emoji in file

### Task 9: Migrate BacklinksPanel.tsx ✅
- **Icons:** Link
- **Verification:** Build succeeds, no emoji in file

---

## Phase 3: Search Components

### Task 10: Migrate SearchBar.tsx ✅
- **Icons:** MessageSquare, Bot, Wrench, BookOpen, Settings, Search, FileText
- **Verification:** Build succeeds, no emoji in file

### Task 11: Migrate CommandPalette.tsx ✅
- **Icons:** FileText, Zap
- **Verification:** Build succeeds, no emoji in file

---

## Phase 4: Shared + Route Components

### Task 12: Migrate ShortcutHelp.tsx ✅
- **Icons:** Keyboard, X
- **Verification:** Build succeeds, no emoji in file, `aria-label="Close"` added to close button

### Task 13: Migrate AgentsPage.tsx ✅
- **Icons:** Bot (fallback only)
- **Verification:** Build succeeds, data-driven emoji preserved

### Task 14: Migrate AgentDetailPage.tsx ✅
- **Icons:** Bot (fallback only)
- **Verification:** Build succeeds, data-driven emoji preserved

### Task 15: Migrate SkillsPage.tsx ✅
- **Icons:** Wrench (fallback only)
- **Verification:** Build succeeds, data-driven emoji preserved

---

## Phase 5: Verification

### Task 16: Bundle size verification ✅
- **Before:** 361.97 kB JS (111.33 kB gzipped)
- **After:** 370.75 kB JS (114.55 kB gzipped)
- **Delta:** +8.78 kB uncompressed, +3.22 kB gzipped
- **Result:** ✅ Well within 15KB gzipped limit

### Task 17: No emoji regression check ✅
- **Migrated components:** Zero emoji found
- **Out-of-scope files (expected):** `NotFoundPage.tsx` (🔍), `SetupPage.tsx` (🧠), `NoteEditor.tsx` (🧠) — these are decorative empty state illustrations, explicitly out of scope

### Task 18: CSS token preservation check ✅
- **CSS file:** `src/index.css` — 174 token references, all preserved
- **CSS hash:** `index-BIEWhsCj.css` — same hash before and after (37.74 kB)
- **Result:** ✅ Zero changes to CSS output
