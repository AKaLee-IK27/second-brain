import { RefObject, useCallback } from 'react';
import { HeadingItem } from '../utils/headingUtils';

/**
 * Builds a Map of heading text to ID for use with MarkdownRenderer.
 * @param headings - Array of heading items
 * @returns Map of heading text to ID
 */
export function buildHeadingIdMap(headings: HeadingItem[]): Map<string, string> {
  const map = new Map<string, string>();
  headings.forEach((h) => {
    map.set(h.text, h.id);
  });
  return map;
}

/**
 * Hook that provides a scroll-to-heading handler for outline navigation.
 * Finds the nearest scrollable ancestor of the target element and scrolls it.
 * @param containerRef - Reference to an element within the scrollable area
 * @returns handleHeadingClick callback
 */
export function useHeadingScroll(
  containerRef: RefObject<HTMLDivElement | null>
): (id: string) => void {
  return useCallback((id: string) => {
    const container = containerRef.current;
    if (!container) return;

    const target = container.querySelector(`[id="${id}"]`) as HTMLElement | null;
    if (!target) return;

    // Find the nearest scrollable ancestor
    let scrollContainer: HTMLElement | null = container;
    while (scrollContainer) {
      if (scrollContainer.scrollHeight > scrollContainer.clientHeight) {
        break;
      }
      scrollContainer = scrollContainer.parentElement;
    }

    // Fallback to window scroll if no scrollable container found
    if (!scrollContainer || scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Calculate position relative to the scroll container
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const scrollTop = scrollContainer.scrollTop;
    const targetTopRelativeToContainer = targetRect.top - containerRect.top + scrollTop;

    scrollContainer.scrollTo({
      top: targetTopRelativeToContainer,
      behavior: 'smooth',
    });
  }, [containerRef]);
}
