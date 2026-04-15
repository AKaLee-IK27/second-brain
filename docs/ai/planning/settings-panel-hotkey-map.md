# Implementation Plan: Settings Panel with Hotkey Map Tab

**Date:** 2026-04-14
**Status:** Complete
**Related Design:** `docs/ai/design/settings-panel-hotkey-map.md`
**Related Requirement:** `docs/ai/requirements/settings-panel-hotkey-map.md`

## Task Overview

| # | Task | Estimated Effort | Dependencies |
|---|------|------------------|--------------|
| 1 | Create `shortcuts-definitions.ts` module | 30 min | None |
| 2 | Extend `ui-store.ts` with settings state | 15 min | None |
| 3 | Create `SettingsPanel.tsx` component | 45 min | Task 2 |
| 4 | Create `SettingsTabBar.tsx` component | 30 min | Task 3 |
| 5 | Create `HotkeyMapTab.tsx` component | 45 min | Task 1, 3 |
| 6 | Create `AboutTab.tsx` component | 30 min | Task 3 |
| 7 | Wire `TopBar.tsx` settings button | 10 min | Task 2 |
| 8 | Mount `SettingsPanel` in `App.tsx` | 10 min | Task 3 |
| 9 | Extend `useKeyboardShortcuts.ts` | 15 min | Task 2 |
| 10 | Update `vite.config.ts` build variables | 10 min | None |
| 11 | Migrate `ShortcutHelp.tsx` to use definitions | 20 min | Task 1 |
| 12 | Migrate `CommandPalette.tsx` display labels | 20 min | Task 1 |

**Total estimated effort:** ~4 hours

---

## Task 1: Create `shortcuts-definitions.ts` Module

**Status:** ⬜ Pending

**Files:**
- Create: `src/config/shortcuts-definitions.ts`

**Implementation:**
1. Define `ShortcutCategory` type union
2. Define `ShortcutDefinition` interface (id, action, category, keys)
3. Export `SHORTCUT_DEFINITIONS` array with all shortcuts from requirements
4. Export `getDisplayKeys()` helper for platform-aware rendering
5. Export `getShortcutsByCategory()` helper for grouped rendering

**Tests:**
- `src/config/__tests__/shortcuts-definitions.test.ts`
  - `getDisplayKeys()` returns correct keys for macOS
  - `getDisplayKeys()` returns correct keys for non-macOS
  - `getShortcutsByCategory()` groups shortcuts correctly
  - All shortcuts have unique IDs

**Verification:**
- [ ] Tests pass
- [ ] TypeScript compiles without errors
- [ ] No lint warnings

---

## Task 2: Extend `ui-store.ts` with Settings State

**Status:** ⬜ Pending

**Files:**
- Modify: `src/state/ui-store.ts`

**Implementation:**
1. Add `settingsOpen: boolean` state
2. Add `settingsTab: 'shortcuts' | 'about'` state
3. Add `_settingsTriggerElement: HTMLElement | null` (internal)
4. Add `toggleSettings()` action with trigger capture and auto-close ShortcutHelp
5. Add `setSettingsTab()` action

**Tests:**
- `src/state/__tests__/ui-store.test.ts` (extend existing)
  - `toggleSettings()` toggles `settingsOpen`
  - `toggleSettings()` captures trigger element
  - `toggleSettings()` auto-closes ShortcutHelp
  - `setSettingsTab()` updates tab

**Verification:**
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] No breaking changes to existing store consumers

---

## Task 3: Create `SettingsPanel.tsx` Component

**Status:** ⬜ Pending

**Files:**
- Create: `src/components/settings/SettingsPanel.tsx`
- Create: `src/components/settings/index.ts` (barrel export)

**Implementation:**
1. Create slide-over panel structure (backdrop + panel)
2. Implement focus trap with `useEffect` Tab cycling
3. Implement focus restoration on unmount
4. Add ARIA attributes (`role="dialog"`, `aria-labelledby`, `aria-modal`)
5. Wire close button and backdrop click
6. Render `SettingsTabBar` and conditional tab content

**Tests:**
- `src/components/settings/__tests__/SettingsPanel.test.tsx`
  - Renders when `settingsOpen` is true
  - Does not render when `settingsOpen` is false
  - Backdrop click closes panel
  - Escape key closes panel
  - Focus trap cycles correctly
  - Focus restoration works on unmount

**Verification:**
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] Manual test: open/close panel, verify focus behavior

---

## Task 4: Create `SettingsTabBar.tsx` Component

**Status:** ⬜ Pending

**Files:**
- Create: `src/components/settings/SettingsTabBar.tsx`

**Implementation:**
1. Render two tab buttons: "Keyboard Shortcuts" and "About"
2. Implement WAI-ARIA manual activation (Arrow keys, Space/Enter)
3. Style active/inactive tabs per design
4. Call `onTabChange` on activation

**Tests:**
- `src/components/settings/__tests__/SettingsTabBar.test.tsx`
  - Renders both tabs
  - Active tab has correct styling
  - Arrow keys move focus
  - Space/Enter activates tab

**Verification:**
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] Keyboard navigation works manually

---

## Task 5: Create `HotkeyMapTab.tsx` Component

**Status:** ⬜ Pending

**Files:**
- Create: `src/components/settings/HotkeyMapTab.tsx`

**Implementation:**
1. Import `SHORTCUT_DEFINITIONS` and `getShortcutsByCategory()`
2. Detect platform once at mount
3. Group shortcuts by category
4. Render each shortcut with `<kbd>` elements
5. Handle empty state

**Tests:**
- `src/components/settings/__tests__/HotkeyMapTab.test.tsx`
  - Groups shortcuts by category
  - Platform-aware rendering (mock `navigator.platform`)
  - Empty state renders correctly

**Verification:**
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] Manual test: verify all shortcuts display correctly

---

## Task 6: Create `AboutTab.tsx` Component

**Status:** ⬜ Pending

**Files:**
- Create: `src/components/settings/AboutTab.tsx`

**Implementation:**
1. Fetch `GET /api/config` on mount
2. Display app name, version, description
3. Conditional repository link
4. Display data root path from API
5. Handle loading and error states

**Tests:**
- `src/components/settings/__tests__/AboutTab.test.tsx`
  - Displays app info correctly
  - Handles API error gracefully
  - Loading state renders

**Verification:**
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] Manual test: verify API data displays

---

## Task 7: Wire `TopBar.tsx` Settings Button

**Status:** ⬜ Pending

**Files:**
- Modify: `src/components/layout/TopBar.tsx`

**Implementation:**
1. Import `useUIStore`
2. Get `toggleSettings` from store
3. Add `onClick={toggleSettings}` to settings button

**Tests:**
- `src/components/layout/__tests__/TopBar.test.tsx` (extend)
  - Settings button click calls `toggleSettings`

**Verification:**
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] Manual test: click opens panel

---

## Task 8: Mount `SettingsPanel` in `App.tsx`

**Status:** ⬜ Pending

**Files:**
- Modify: `src/routes/App.tsx`

**Implementation:**
1. Import `SettingsPanel`
2. Add conditional render: `{settingsOpen && <SettingsPanel />}`

**Tests:**
- `src/routes/__tests__/App.test.tsx` (extend)
  - SettingsPanel renders conditionally

**Verification:**
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] Manual test: panel mounts/unmounts correctly

---

## Task 9: Extend `useKeyboardShortcuts.ts`

**Status:** ⬜ Pending

**Files:**
- Modify: `src/hooks/useKeyboardShortcuts.ts`

**Implementation:**
1. Add Escape handler for settings panel
2. Add `toggleSettings` to dependency array

**Tests:**
- `src/hooks/__tests__/useKeyboardShortcuts.test.ts` (extend)
  - Escape closes settings panel

**Verification:**
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] Manual test: Escape closes panel

---

## Task 10: Update `vite.config.ts` Build Variables

**Status:** ⬜ Pending

**Files:**
- Modify: `vite.config.ts`

**Implementation:**
1. Read `package.json` version
2. Add `define` block with `PACKAGE_VERSION` and `REPOSITORY_URL`

**Tests:**
- None (build configuration)

**Verification:**
- [ ] `npm run build` succeeds
- [ ] `import.meta.env.PACKAGE_VERSION` is accessible in app

---

## Task 11: Migrate `ShortcutHelp.tsx` to Use Definitions

**Status:** ⬜ Pending

**Files:**
- Modify: `src/components/shared/ShortcutHelp.tsx`

**Implementation:**
1. Remove local `SHORTCUTS` constant
2. Import `SHORTCUT_DEFINITIONS` and `getDisplayKeys()`
3. Map to display format

**Tests:**
- `src/components/shared/__tests__/ShortcutHelp.test.tsx` (existing)
  - Still renders all shortcuts correctly

**Verification:**
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] Manual test: modal still shows all shortcuts

---

## Task 12: Migrate `CommandPalette.tsx` Display Labels

**Status:** ⬜ Pending

**Files:**
- Modify: `src/components/search/CommandPalette.tsx`

**Implementation:**
1. Import `getDisplayKeys()` and relevant shortcuts
2. Replace hardcoded `shortcut` strings with `getDisplayKeys()` output
3. Keep local `commands` array with action functions

**Tests:**
- `src/components/search/__tests__/CommandPalette.test.tsx` (existing)
  - Still displays shortcuts correctly

**Verification:**
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] Manual test: command palette shows correct shortcuts

---

## Definition of Done

- [ ] All 12 tasks complete
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] No lint errors (`npm run lint` if available)
- [ ] Manual verification: settings panel opens, tabs work, shortcuts display, about tab shows data
- [ ] Accessibility check: keyboard navigation, focus trap, ARIA attributes
