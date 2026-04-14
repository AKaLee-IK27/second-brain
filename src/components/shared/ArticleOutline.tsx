import { useState, useRef, useEffect, useCallback } from 'react';
import { MaterialIcon } from './MaterialIcon';

export interface HeadingItem {
  id: string;
  level: number;  // 1-6
  text: string;
}

export interface ArticleOutlineProps {
  headings: HeadingItem[];
  activeHeadingId: string | null;
  onHeadingClick: (id: string) => void;
}

const paddingClasses: Record<number, string> = {
  1: '',
  2: 'pl-4',
  3: 'pl-8',
  4: 'pl-12',
  5: 'pl-16',
  6: 'pl-20',
};

export function ArticleOutline({ headings, activeHeadingId, onHeadingClick }: ArticleOutlineProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return sessionStorage.getItem('outline-collapsed-state') === 'true';
    } catch {
      return false;
    }
  });

  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        sessionStorage.setItem('outline-collapsed-state', String(next));
      } catch {
        // sessionStorage may be unavailable in some contexts
      }
      return next;
    });
  }, []);

  const focusItem = useCallback((index: number) => {
    if (index >= 0 && index < headings.length) {
      itemRefs.current[index]?.focus();
    }
  }, [headings.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusItem((index + 1) % headings.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusItem((index - 1 + headings.length) % headings.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onHeadingClick(headings[index].id);
        break;
      case 'Escape':
        e.preventDefault();
        setIsCollapsed(true);
        try {
          sessionStorage.setItem('outline-collapsed-state', 'true');
        } catch {}
        toggleButtonRef.current?.focus();
        break;
    }
  }, [headings, onHeadingClick, focusItem]);

  // Focus first item when expanding
  useEffect(() => {
    if (!isCollapsed && headings.length > 0) {
      const timer = setTimeout(() => {
        focusItem(0);
      }, 200); // Wait for collapse animation to complete
      return () => clearTimeout(timer);
    }
  }, [isCollapsed, headings.length, focusItem]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="font-mono text-[10px] text-outline-variant uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
        <span>Outline</span>
        <button
          ref={toggleButtonRef}
          onClick={toggleCollapse}
          className="cursor-pointer hover:text-primary transition-colors duration-150"
          aria-label={isCollapsed ? 'Expand outline' : 'Collapse outline'}
        >
          <MaterialIcon name={isCollapsed ? 'expand_more' : 'segment'} size={14} />
        </button>
      </h3>
      <div
        className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${
          isCollapsed ? 'max-h-0' : 'max-h-[500px]'
        }`}
      >
        <ul role="list" className="flex flex-col gap-3">
          {headings.map((heading, index) => (
            <li
              key={heading.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              role="listitem"
              tabIndex={0}
              onClick={() => onHeadingClick(heading.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                font-headline text-sm text-on-surface-variant hover:text-primary cursor-pointer transition-colors duration-150 truncate
                focus-visible:outline-2 focus-visible:outline-primary
                ${activeHeadingId === heading.id ? 'text-primary border-l-2 border-primary-container' : ''}
                ${paddingClasses[heading.level]}
              `}
              title={heading.text}
            >
              {heading.level === 1 && (
                <span className="w-1 h-1 bg-primary-container rounded-full mr-2 inline-block" />
              )}
              {heading.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
