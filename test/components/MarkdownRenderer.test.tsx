import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '../../src/components/shared/MarkdownRenderer';

// Mock DOMPurify to pass through HTML without sanitization for testing
vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

describe('MarkdownRenderer', () => {
  it('renders markdown content', () => {
    render(<MarkdownRenderer content="# Hello World" />);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('injects heading IDs when headingIds prop is provided', () => {
    const headingIds = new Map<string, string>([
      ['Introduction', 'introduction'],
      ['Background', 'background'],
    ]);

    const { container } = render(
      <MarkdownRenderer
        content="# Introduction\n## Background"
        headingIds={headingIds}
      />
    );

    const h1 = container.querySelector('h1');
    const h2 = container.querySelector('h2');

    expect(h1?.getAttribute('id')).toBe('introduction');
    expect(h2?.getAttribute('id')).toBe('background');
  });

  it('generates fallback IDs for headings not in the map', () => {
    const headingIds = new Map<string, string>([
      ['Introduction', 'introduction'],
    ]);

    const { container } = render(
      <MarkdownRenderer
        content="# Introduction\n## Unknown Heading"
        headingIds={headingIds}
      />
    );

    const h1 = container.querySelector('h1');
    const h2 = container.querySelector('h2');

    expect(h1?.getAttribute('id')).toBe('introduction');
    // Unknown heading should get a generated ID
    expect(h2?.getAttribute('id')).toBeTruthy();
    expect(h2?.getAttribute('id')).toContain('unknown-heading');
  });

  it('renders without headingIds prop (backward compatible)', () => {
    const { container } = render(
      <MarkdownRenderer content="# No IDs" />
    );

    const h1 = container.querySelector('h1');
    // Without headingIds prop, headings should still render but without IDs
    expect(h1).toBeTruthy();
    expect(h1?.getAttribute('id')).toBeNull();
  });

  it('handles special characters in heading text for ID generation', () => {
    const headingIds = new Map<string, string>([
      ["What's New?", 'whats-new'],
      ['C++ Basics', 'c-basics'],
    ]);

    const { container } = render(
      <MarkdownRenderer
        content="# What's New?\n## C++ Basics"
        headingIds={headingIds}
      />
    );

    const h1 = container.querySelector('h1');
    const h2 = container.querySelector('h2');

    expect(h1?.getAttribute('id')).toBe('whats-new');
    expect(h2?.getAttribute('id')).toBe('c-basics');
  });
});
