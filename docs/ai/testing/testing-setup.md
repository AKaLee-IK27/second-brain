# Testing Setup

## Overview

AKL's Knowledge uses **Vitest** as its test runner and assertion framework, with **React Testing Library** for component testing and **jsdom** as the DOM environment. The test suite covers frontend components, hooks, routes, utilities, and backend integration tests.

**Test stack:**
- **Runner**: Vitest v4.1.4
- **Environment**: jsdom v29.0.2
- **Component testing**: @testing-library/react v16.3.2
- **User interaction**: @testing-library/user-event v14.6.1
- **Assertions**: @testing-library/jest-dom v6.9.1 (via setup file)
- **Coverage**: v8 provider
- **UI**: @vitest/ui v4.1.4 (optional visual test runner)

## Test Architecture

```mermaid
graph TD
    A[Vitest Runner] --> B[jsdom Environment]
    A --> C[test/setup.ts]
    C --> D[@testing-library/jest-dom]
    A --> E[test/**/*.test.{ts,tsx}]
    E --> F[test/components/]
    E --> G[test/hooks/]
    E --> H[test/routes/]
    E --> I[test/utils/]
    E --> J[test/server/]
    F --> K[Component tests]
    G --> L[Hook tests]
    H --> M[Route/Page tests]
    I --> N[Utility function tests]
    J --> O[Backend integration tests]
    A --> P[v8 Coverage Provider]
    P --> Q[text reporter]
    P --> R[json reporter]
    P --> S[html reporter]
```

## Configuration Reference

### `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,              // Enable global test APIs (describe, it, expect, vi)
    environment: 'jsdom',       // Simulate browser DOM environment
    setupFiles: ['./test/setup.ts'],  // Run before each test file
    include: ['test/**/*.test.{ts,tsx}'],  // Test file pattern
    coverage: {
      provider: 'v8',           // Use V8 engine for coverage (more accurate than istanbul)
      reporter: ['text', 'json', 'html'],  // Output formats
      exclude: ['node_modules/', 'test/'], // Exclude test files from coverage
    },
  },
});
```

| Setting | Value | Purpose |
|---------|-------|---------|
| `globals` | `true` | Makes `describe`, `it`, `expect`, `vi` available without imports |
| `environment` | `'jsdom'` | Provides browser-like DOM for React component testing |
| `setupFiles` | `['./test/setup.ts']` | Imports `@testing-library/jest-dom` for custom matchers |
| `include` | `['test/**/*.test.{ts,tsx}']` | Only files under `test/` with `.test.ts` or `.test.tsx` extension |
| `coverage.provider` | `'v8'` | Uses Node.js V8 coverage (faster, more accurate than istanbul) |
| `coverage.reporter` | `['text', 'json', 'html']` | Console output, JSON file, and browsable HTML report |
| `coverage.exclude` | `['node_modules/', 'test/']` | Excludes dependencies and test files from coverage |

### `test/setup.ts`

```ts
import '@testing-library/jest-dom';
```

Single-line setup that imports `@testing-library/jest-dom`, which extends Vitest's `expect` with DOM-specific matchers:

- `toBeInTheDocument()`
- `toHaveClass()`
- `toHaveAttribute()`
- `toHaveFocus()`
- `toBeTruthy()` / `toBeFalsy()`
- And many more

## Test File Structure

```
test/
├── setup.ts                          # Global test setup (jest-dom)
├── components/                       # Component tests
│   ├── ArticleOutline.test.tsx       # Shared component tests
│   ├── MarkdownRenderer.test.tsx     # Shared component tests
│   ├── graph/
│   │   └── UnifiedGraph.test.tsx     # Graph visualization component
│   ├── knowledge/
│   │   └── KnowledgeComponents.test.tsx  # Knowledge display components
│   ├── layout/
│   │   └── Sidebar.test.tsx          # Layout component tests
│   └── opencode/                     # OpenCode-specific components (empty)
├── hooks/
│   └── useScrollSpy.test.ts          # Custom hook tests
├── routes/
│   └── OpenCodePage.test.tsx         # Page/route component tests
├── utils/
│   └── headingUtils.test.ts          # Pure utility function tests
└── server/                           # Backend integration tests (empty)
```

### Naming Conventions

| Pattern | Example |
|---------|---------|
| Component tests | `ComponentName.test.tsx` |
| Hook tests | `useHookName.test.ts` |
| Utility tests | `utilityModule.test.ts` |
| Route tests | `PageName.test.tsx` |
| Grouped tests | `FeatureComponents.test.tsx` (multiple related components) |

Tests mirror the source structure under `src/` but live in a separate `test/` directory at the project root.

## Testing Patterns

### Component Tests

**Basic rendering and interaction:**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from '../../src/components/path/ComponentName';

describe('ComponentName', () => {
  it('renders with expected content', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('calls callback on click', () => {
    const onClick = vi.fn();
    render(<ComponentName onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

**Testing with async rendering (`act` wrapper):**

```tsx
import { render, screen, act } from '@testing-library/react';

it('handles async content', async () => {
  let container: HTMLElement;
  await act(async () => {
    const result = render(<Component />);
    container = result.container;
  });
  // assertions using container
});
```

**Testing keyboard navigation:**

```tsx
it('handles ArrowDown key', () => {
  render(<Component />);
  const item = screen.getByText('First Item');
  item.focus();
  fireEvent.keyDown(item, { key: 'ArrowDown' });
  expect(screen.getByText('Second Item')).toHaveFocus();
});
```

**Testing CSS class changes (Tailwind):**

```tsx
it('applies correct padding for heading levels', () => {
  render(<ArticleOutline headings={mockHeadings} />);
  expect(screen.getByText('Background')).toHaveClass('pl-4');
  expect(screen.getByText('Details')).toHaveClass('pl-8');
});
```

### Hook Tests

**Using `renderHook` with fake timers:**

```tsx
import { renderHook, act } from '@testing-library/react';
import { useHook } from '../../src/hooks/useHook';

describe('useHook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('returns expected value', () => {
    const { result } = renderHook(() => useHook(args));
    expect(result.current).toBe(expectedValue);
  });

  it('handles throttled updates', () => {
    const { result } = renderHook(() => useHook(args));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(updatedValue);
  });
});
```

**Mocking browser APIs (IntersectionObserver):**

```tsx
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  constructor(callback: (entries: any[]) => void) {
    // store callback for manual invocation
  }
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
```

### Route/Page Tests

**Testing with React Router:**

```tsx
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Page from '../../src/routes/Page';

it('renders page content', async () => {
  render(
    <MemoryRouter initialEntries={['/path']}>
      <Routes>
        <Route path="/path" element={<Page />} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => {
    expect(screen.getByText('Page Title')).toBeInTheDocument();
  });
});
```

**Testing navigation:**

```tsx
import { MemoryRouter, useLocation } from 'react-router-dom';

it('navigates on click', async () => {
  let currentPath = '';
  function LocationTracker() {
    const location = useLocation();
    currentPath = location.pathname;
    return null;
  }

  render(
    <MemoryRouter initialEntries={['/']}>
      <LocationTracker />
      <ComponentWithNavigation />
    </MemoryRouter>
  );

  // trigger navigation
  await waitFor(() => {
    expect(currentPath).toBe('/target-path');
  });
});
```

### API Mocking

**Using `vi.hoisted` for mock hoisting:**

```tsx
const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    agents: { list: vi.fn().mockResolvedValue({ agents: [] }) },
    skills: { list: vi.fn().mockResolvedValue({ skills: [] }) },
  },
}));

vi.mock('../../src/services/api', () => ({
  api: mockApi,
}));
```

**Mocking Zustand stores:**

```tsx
vi.mock('../../src/state/app-store', () => ({
  useAppStore: vi.fn(() => ({
    dataRoot: '/test/data',
    watcherStatus: 'watching',
  })),
}));
```

**Mocking components:**

```tsx
vi.mock('../../src/components/shared/MaterialIcon', () => ({
  MaterialIcon: ({ name, size }: { name: string; size: number }) => (
    <span data-testid={`icon-${name}`} style={{ width: size }}>
      {name}
    </span>
  ),
}));
```

### Utility Function Tests

**Pure function testing (no DOM needed):**

```tsx
import { describe, it, expect } from 'vitest';
import { extractHeadings, generateSlug } from '../../src/utils/headingUtils';

describe('headingUtils', () => {
  describe('extractHeadings', () => {
    it('extracts H1-H6 headings from markdown', () => {
      const headings = extractHeadings('# Hello\n## World');
      expect(headings).toHaveLength(2);
      expect(headings[0]).toEqual({ id: 'hello', level: 1, text: 'Hello' });
    });
  });
});
```

### Mocking Web APIs

**Mocking `sessionStorage`:**

```tsx
const mockSessionStorage: Record<string, string> = {};
const sessionStorageMock = {
  getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockSessionStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockSessionStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]); }),
};
vi.stubGlobal('sessionStorage', sessionStorageMock);
```

**Resetting mocks between tests:**

```tsx
beforeEach(() => {
  sessionStorageMock.clear();
  vi.clearAllMocks();
});
```

## Running Tests

### Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run Vitest in watch mode (default) |
| `npm run test:ui` | Run with Vitest UI (visual test runner at `http://localhost:51204`) |
| `npm run test:coverage` | Run with coverage reporting |

### Filtering Tests

**Run a specific test file:**
```bash
npm test -- test/components/MarkdownRenderer.test.tsx
```

**Run tests matching a name pattern:**
```bash
npm test -- -t "MarkdownRenderer"
npm test -- -t "renders markdown content"
```

**Run tests in a specific directory:**
```bash
npm test -- test/hooks/
npm test -- test/components/graph/
```

**Run only changed tests (watch mode):**
```bash
npm test
# Then press:
#   a - run all tests
#   f - run failed tests
#   p - filter by filename
#   t - filter by test name
#   q - quit watch mode
```

**Run tests once (CI mode):**
```bash
npm test -- --run
```

### Coverage

```bash
npm run test:coverage
```

Generates three output formats:
- **text**: Printed to console
- **json**: Written to `coverage/coverage-final.json`
- **html**: Written to `coverage/index.html` (open in browser)

Coverage excludes:
- `node_modules/`
- `test/` (test files themselves)

## Key Decisions and Patterns

### 1. Separate `test/` Directory

Tests live in `test/` at the project root rather than colocated with source files (`src/`). This keeps the source directory clean and makes it easy to run tests against the entire codebase with a single pattern.

### 2. `vi.hoisted` for API Mocks

API mocks use `vi.hoisted()` to ensure the mock object is created before the `vi.mock()` call is hoisted. This pattern allows mock implementations to be shared across tests and reset in `beforeEach`.

### 3. Fake Timers for Throttling Tests

Hooks with throttling/debouncing use `vi.useFakeTimers()` with `vi.advanceTimersByTime()` to test time-dependent behavior deterministically.

### 4. `LocationTracker` Pattern for Navigation Testing

A helper `LocationTracker` component using `useLocation()` is rendered alongside components under test to capture navigation changes without needing to inspect router internals.

### 5. `renderWithRouter` Helper

A custom `renderWithRouter` function wraps components with `MemoryRouter` for consistent router setup across tests.

### 6. Manual Observer Invocation

For `IntersectionObserver`-dependent hooks, a `MockIntersectionObserver` class captures the callback, which is then manually invoked via `act()` to simulate intersection events.

### 7. Grouped Component Tests

Related small components are tested together in a single file (e.g., `KnowledgeComponents.test.tsx` tests `KnowledgeSnippetCard`, `KnowledgeSnippetsList`, and `KnowledgeBadge` together).

## Gotchas

1. **`globals: true` means no imports needed**: `describe`, `it`, `expect`, `vi` are globally available. However, many test files still import them explicitly — this is fine and makes the file more portable.

2. **`act()` for async renders**: When a component performs async work during render (e.g., data fetching), wrap the `render()` call in `await act(async () => { ... })` to avoid React warnings.

3. **`vi.clearAllMocks()` vs `vi.restoreAllMocks()`**: 
   - `clearAllMocks()` resets call counts and arguments but keeps mock implementations
   - `restoreAllMocks()` restores original implementations (use after `vi.spyOn()`)

4. **Fake timers must be cleaned up**: Always call `vi.restoreAllMocks()` and `vi.clearAllTimers()` in `afterEach` when using `vi.useFakeTimers()`, otherwise subsequent tests may behave unexpectedly.

5. **`vi.stubGlobal` persists across tests**: Global stubs (like `sessionStorage`, `IntersectionObserver`) should be cleared or reset in `beforeEach` to avoid test pollution.

6. **Coverage excludes test files**: The `coverage.exclude` setting includes `'test/'`, so test files themselves are not counted toward coverage percentages.

7. **`test/server/` directory exists but is empty**: Backend integration tests are planned but not yet implemented. The directory structure is ready for Express API tests.

8. **Playwright is installed but not configured**: `playwright` is listed in devDependencies but there is no Playwright configuration or E2E test setup yet.

## Related Documentation

- [Project Overview](../../AGENTS.md) — Architecture and developer commands
- [CLI Packaging Requirements](../requirements/cli-packaging.md) — CLI and testing considerations
- [New Design System Requirements](../requirements/new-design-system.md) — Component design specs
