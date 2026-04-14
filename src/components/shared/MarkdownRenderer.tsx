import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  /**
   * Optional map of heading text to ID for injecting IDs into rendered headings.
   * If a heading's text is not in the map, a fallback ID will be generated.
   */
  headingIds?: Map<string, string>;
}

/**
 * Generates a URL-safe slug from heading text.
 */
function generateSlug(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return base || `heading-h-${index}`;
}

export function MarkdownRenderer({ content, className, headingIds }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && content) {
      let html: string;

      if (headingIds && headingIds.size > 0) {
        // Use custom renderer to inject IDs during parsing
        const slugCounts: Record<string, number> = {};
        let headingIndex = 0;

        const renderer = new marked.Renderer();
        renderer.heading = ({ text, depth }) => {
          const cleanText = text.trim().replace(/\s+/g, ' ');
          let id: string | undefined;

          // Try to find a matching ID in the map
          for (const [key, value] of headingIds.entries()) {
            if (key.trim().replace(/\s+/g, ' ') === cleanText) {
              id = value;
              break;
            }
          }

          if (!id) {
            id = generateSlug(cleanText, headingIndex);
          }

          const count = slugCounts[id] || 0;
          slugCounts[id] = count + 1;
          const finalId = count > 0 ? `${id}-${count}` : id;
          headingIndex++;

          return `<h${depth} id="${finalId}">${text}</h${depth}>`;
        };

        html = marked.parse(content, { renderer }) as string;
      } else {
        html = marked.parse(content) as string;
      }

      containerRef.current.innerHTML = DOMPurify.sanitize(html);
    }
  }, [content, headingIds]);

  return <div ref={containerRef} className={`prose prose-invert max-w-none ${className || ''}`} />;
}
