/**
 * Represents a heading item extracted from markdown.
 */
export interface HeadingItem {
  id: string;
  level: number;  // 1-6
  text: string;
}

/**
 * Extracts headings (H1-H6) from raw markdown text with unique ID generation.
 * @param markdown - The raw markdown string
 * @returns Array of heading items with generated IDs
 */
export function extractHeadings(markdown: string): HeadingItem[] {
  const regex = /^(#{1,6})\s+(.+)$/gm;
  const slugCounts: Record<string, number> = {};
  const headings: HeadingItem[] = [];
  let match;
  let index = 0;

  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateSlug(text, level, index, slugCounts);
    headings.push({ id, level, text });
    index++;
  }

  return headings;
}

/**
 * Generates a URL-safe slug from heading text with duplicate handling.
 * @param text - The heading text
 * @param level - The heading level (1-6)
 * @param index - The heading index in the document
 * @param counts - Track of slug occurrence counts for duplicate handling
 * @returns A URL-safe slug ID
 */
export function generateSlug(
  text: string,
  level: number,
  index: number,
  counts: Record<string, number>
): string {
  const base = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  if (!base) {
    // Fallback for text with only special characters (e.g., "## !!!")
    // Uses level and index to produce deterministic IDs like heading-h1-0, heading-h3-2
    return `heading-h${level}-${index}`;
  }

  const count = counts[base] || 0;
  counts[base] = count + 1;
  return count > 0 ? `${base}-${count}` : base;
}
