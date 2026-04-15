import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MarkdownRenderer } from '../../src/components/shared/MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders markdown content', () => {
    render(<MarkdownRenderer content="# Hello World" />);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('injects heading IDs when headingIds prop is provided', async () => {
    const headingIds = new Map<string, string>([
      ['Introduction', 'introduction'],
      ['Background', 'background'],
    ]);

    const content = `# Introduction
## Background`;

    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <MarkdownRenderer
          content={content}
          headingIds={headingIds}
        />
      );
      container = result.container;
    });

    const h1 = container!.querySelector('h1');
    const h2 = container!.querySelector('h2');

    expect(h1?.getAttribute('id')).toBe('introduction');
    expect(h2?.getAttribute('id')).toBe('background');
  });

  it('generates fallback IDs for headings not in the map', async () => {
    const headingIds = new Map<string, string>([
      ['Introduction', 'introduction'],
    ]);

    const content = `# Introduction
## Unknown Heading`;

    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <MarkdownRenderer
          content={content}
          headingIds={headingIds}
        />
      );
      container = result.container;
    });

    const h1 = container!.querySelector('h1');
    const h2 = container!.querySelector('h2');

    expect(h1?.getAttribute('id')).toBe('introduction');
    expect(h2?.getAttribute('id')).toBe('unknown-heading');
  });

  it('renders without headingIds prop (backward compatible)', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <MarkdownRenderer content="# No IDs" />
      );
      container = result.container;
    });

    const h1 = container!.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1?.getAttribute('id')).toBeNull();
  });

  it('handles special characters in heading text for ID generation', async () => {
    const headingIds = new Map<string, string>([
      ["What's New?", 'whats-new'],
      ['C++ Basics', 'c-basics'],
    ]);

    const content = `# What's New?
## C++ Basics`;

    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <MarkdownRenderer
          content={content}
          headingIds={headingIds}
        />
      );
      container = result.container;
    });

    const h1 = container!.querySelector('h1');
    const h2 = container!.querySelector('h2');

    expect(h1?.getAttribute('id')).toBe('whats-new');
    expect(h2?.getAttribute('id')).toBe('c-basics');
  });
});
