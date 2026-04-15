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
            // Fallback: generate a semantic slug with duplicate handling
            const base = cleanText
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');

            if (!base) {
              // Fallback for text with only special characters
              id = `heading-h${depth}-${headingIndex}`;
            } else {
              const count = slugCounts[base] || 0;
              slugCounts[base] = count + 1;
              id = count > 0 ? `${base}-${count}` : base;
            }
          }

          headingIndex++;

          return `<h${depth} id="${id}">${text}</h${depth}>`;
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
