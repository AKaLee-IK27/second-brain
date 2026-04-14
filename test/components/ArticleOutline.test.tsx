import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ArticleOutline } from '../../src/components/shared/ArticleOutline';

// Mock sessionStorage
const mockSessionStorage: Record<string, string> = {};
const sessionStorageMock = {
  getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockSessionStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockSessionStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]);
  }),
};
vi.stubGlobal('sessionStorage', sessionStorageMock);

const mockHeadings = [
  { id: 'introduction', level: 1, text: 'Introduction' },
  { id: 'background', level: 2, text: 'Background' },
  { id: 'details', level: 3, text: 'Details' },
  { id: 'more-details', level: 4, text: 'More Details' },
  { id: 'even-more', level: 5, text: 'Even More' },
  { id: 'final', level: 6, text: 'Final' },
];

describe('ArticleOutline', () => {
  beforeEach(() => {
    sessionStorageMock.clear();
    vi.clearAllMocks();
  });

  it('renders heading list with correct text and indentation', () => {
    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    expect(screen.getByText('Introduction')).toBeTruthy();
    expect(screen.getByText('Background')).toBeTruthy();
    expect(screen.getByText('Details')).toBeTruthy();
    expect(screen.getByText('More Details')).toBeTruthy();
    expect(screen.getByText('Even More')).toBeTruthy();
    expect(screen.getByText('Final')).toBeTruthy();
  });

  it('calls onHeadingClick when a heading is clicked', () => {
    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    fireEvent.click(screen.getByText('Background'));
    expect(onHeadingClick).toHaveBeenCalledWith('background');
  });

  it('highlights the active heading', () => {
    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId="background"
        onHeadingClick={onHeadingClick}
      />
    );

    const activeItem = screen.getByText('Background');
    expect(activeItem).toHaveClass('text-primary');
    expect(activeItem).toHaveClass('border-l-2');
    expect(activeItem).toHaveClass('border-primary-container');
  });

  it('collapses when toggle button is clicked', () => {
    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    // Initially expanded
    expect(screen.getByText('Introduction')).toBeTruthy();

    // Click toggle button
    const toggleButton = screen.getByRole('button', { name: /collapse outline/i });
    fireEvent.click(toggleButton);

    // Should be collapsed - check for max-h-0 class on the container
    const container = toggleButton.closest('section')?.querySelector('[class*="max-h-0"]');
    expect(container).toBeTruthy();
  });

  it('expands when toggle button is clicked while collapsed', () => {
    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    // Collapse first
    const toggleButton = screen.getByRole('button', { name: /collapse outline/i });
    fireEvent.click(toggleButton);

    // Check collapsed state
    const collapsedContainer = toggleButton.closest('section')?.querySelector('[class*="max-h-0"]');
    expect(collapsedContainer).toBeTruthy();

    // Expand again
    const expandButton = screen.getByRole('button', { name: /expand outline/i });
    fireEvent.click(expandButton);

    // Should be expanded - check for max-h-[500px] class
    const expandedContainer = toggleButton.closest('section')?.querySelector('[class*="max-h-\\[500px\\]"]');
    expect(expandedContainer).toBeTruthy();
  });

  it('persists collapsed state to sessionStorage', () => {
    const onHeadingClick = vi.fn();
    const { rerender } = render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    // Collapse
    const toggleButton = screen.getByRole('button', { name: /collapse outline/i });
    fireEvent.click(toggleButton);

    // Check sessionStorage
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('outline-collapsed-state', 'true');

    // Rerender to check persistence
    rerender(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    // Should still be collapsed - check for max-h-0 class
    const container = toggleButton.closest('section')?.querySelector('[class*="max-h-0"]');
    expect(container).toBeTruthy();
  });

  it('reads collapsed state from sessionStorage on mount', () => {
    mockSessionStorage['outline-collapsed-state'] = 'true';

    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    // Should be collapsed on mount - check for max-h-0 class
    const toggleButton = screen.getByRole('button', { name: /expand outline/i });
    const container = toggleButton.closest('section')?.querySelector('[class*="max-h-0"]');
    expect(container).toBeTruthy();
  });

  it('handles keyboard navigation with ArrowDown', () => {
    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    const firstItem = screen.getByText('Introduction');
    firstItem.focus();

    // Press ArrowDown
    fireEvent.keyDown(firstItem, { key: 'ArrowDown' });

    // Focus should move to next item
    const secondItem = screen.getByText('Background');
    expect(secondItem).toHaveFocus();
  });

  it('handles keyboard navigation with ArrowUp', () => {
    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    const secondItem = screen.getByText('Background');
    secondItem.focus();

    // Press ArrowUp
    fireEvent.keyDown(secondItem, { key: 'ArrowUp' });

    // Focus should move to previous item
    const firstItem = screen.getByText('Introduction');
    expect(firstItem).toHaveFocus();
  });

  it('handles Enter key to activate heading', () => {
    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    const firstItem = screen.getByText('Introduction');
    firstItem.focus();

    // Press Enter
    fireEvent.keyDown(firstItem, { key: 'Enter' });

    expect(onHeadingClick).toHaveBeenCalledWith('introduction');
  });

  it('handles Escape key to collapse outline', () => {
    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    const firstItem = screen.getByText('Introduction');
    firstItem.focus();

    // Press Escape
    fireEvent.keyDown(firstItem, { key: 'Escape' });

    // Should be collapsed - check for max-h-0 class
    const toggleButton = screen.getByRole('button', { name: /expand outline/i });
    const container = toggleButton.closest('section')?.querySelector('[class*="max-h-0"]');
    expect(container).toBeTruthy();
  });

  it('applies correct padding classes for different heading levels', () => {
    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    const h1Item = screen.getByText('Introduction');
    const h2Item = screen.getByText('Background');
    const h3Item = screen.getByText('Details');
    const h4Item = screen.getByText('More Details');
    const h5Item = screen.getByText('Even More');
    const h6Item = screen.getByText('Final');

    expect(h1Item).not.toHaveClass('pl-4');
    expect(h2Item).toHaveClass('pl-4');
    expect(h3Item).toHaveClass('pl-8');
    expect(h4Item).toHaveClass('pl-12');
    expect(h5Item).toHaveClass('pl-16');
    expect(h6Item).toHaveClass('pl-20');
  });

  it('shows H1 indicator dot for level 1 headings', () => {
    const onHeadingClick = vi.fn();
    render(
      <ArticleOutline
        headings={mockHeadings}
        activeHeadingId={null}
        onHeadingClick={onHeadingClick}
      />
    );

    const h1Item = screen.getByText('Introduction');
    const indicator = h1Item.parentElement?.querySelector('.bg-primary-container');
    expect(indicator).toBeTruthy();
  });
});
