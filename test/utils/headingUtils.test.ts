import { describe, it, expect } from 'vitest';
import { extractHeadings, generateSlug } from '../../src/utils/headingUtils';

describe('headingUtils', () => {
  describe('extractHeadings', () => {
    it('extracts H1-H6 headings from markdown', () => {
      const markdown = `
# Introduction
## Background
### Details
#### More Details
##### Even More
###### Final Level
`;
      const headings = extractHeadings(markdown);
      expect(headings).toHaveLength(6);
      expect(headings[0]).toEqual({ id: 'introduction', level: 1, text: 'Introduction' });
      expect(headings[1]).toEqual({ id: 'background', level: 2, text: 'Background' });
      expect(headings[5]).toEqual({ id: 'final-level', level: 6, text: 'Final Level' });
    });

    it('handles duplicate heading texts with numeric suffixes', () => {
      const markdown = `
# Summary
## Summary
### Summary
# Summary
`;
      const headings = extractHeadings(markdown);
      expect(headings[0].id).toBe('summary');
      expect(headings[1].id).toBe('summary-1');
      expect(headings[2].id).toBe('summary-2');
      expect(headings[3].id).toBe('summary-3');
    });

    it('generates fallback IDs for headings with only special characters', () => {
      const markdown = `
# !!!
## ???
# !!!
`;
      const headings = extractHeadings(markdown);
      expect(headings[0].id).toMatch(/^heading-h1-\d+$/);
      expect(headings[1].id).toMatch(/^heading-h2-\d+$/);
      expect(headings[2].id).toMatch(/^heading-h1-\d+$/);
    });

    it('returns empty array for markdown with no headings', () => {
      const markdown = 'Just some text without headings';
      const headings = extractHeadings(markdown);
      expect(headings).toHaveLength(0);
    });

    it('handles headings with special characters', () => {
      const markdown = `
# What's New?
## C++ Basics
### 100% Complete
`;
      const headings = extractHeadings(markdown);
      expect(headings[0].id).toBe('whats-new');
      expect(headings[1].id).toBe('c-basics');
      expect(headings[2].id).toBe('100-complete');
    });

    it('trims whitespace from heading text', () => {
      const markdown = '#   Trimmed Heading   ';
      const headings = extractHeadings(markdown);
      expect(headings[0].text).toBe('Trimmed Heading');
    });
  });

  describe('generateSlug', () => {
    it('converts text to lowercase with hyphens', () => {
      expect(generateSlug('Hello World', 1, 0, {})).toBe('hello-world');
    });

    it('removes non-alphanumeric characters except hyphens', () => {
      expect(generateSlug('What?! Is This@ Real#', 1, 0, {})).toBe('what-is-this-real');
    });

    it('handles duplicate slugs with counter', () => {
      const counts: Record<string, number> = {};
      expect(generateSlug('Intro', 1, 0, counts)).toBe('intro');
      expect(generateSlug('Intro', 1, 1, counts)).toBe('intro-1');
      expect(generateSlug('Intro', 1, 2, counts)).toBe('intro-2');
    });

    it('generates fallback ID for empty base slug', () => {
      expect(generateSlug('!!!', 1, 5, {})).toBe('heading-h1-5');
      expect(generateSlug('???', 3, 10, {})).toBe('heading-h3-10');
    });
  });
});
