import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && content) {
      const html = marked.parse(content) as string;
      containerRef.current.innerHTML = DOMPurify.sanitize(html);
    }
  }, [content]);

  return <div ref={containerRef} className={`prose prose-invert max-w-none ${className || ''}`} />;
}
