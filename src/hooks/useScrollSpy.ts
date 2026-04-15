import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Finds the nearest scrollable ancestor of the given element.
 * @param element - The starting element
 * @returns The nearest scrollable ancestor, or null if none found
 */
function findScrollContainer(element: HTMLElement | null): HTMLElement | null {
  let current: HTMLElement | null = element;
  while (current) {
    if (current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Hook that tracks which heading is currently visible in the viewport.
 * Uses scroll event listener with throttling. Automatically finds the
 * nearest scrollable ancestor if the provided container doesn't scroll.
 *
 * @param containerRef - Reference to an element within the scrollable area
 * @param headingIds - Array of heading IDs to track
 * @returns The ID of the currently active heading, or null if none is visible
 */
export function useScrollSpy(
  containerRef: React.RefObject<HTMLElement | null>,
  headingIds: string[]
): string | null {
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const tickingRef = useRef(false);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  const container = containerRef?.current || null;

  const findActiveHeading = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || headingIds.length === 0) return;

    const now = performance.now();
    // Throttle to max 10 updates per second (100ms minimum interval)
    if (now - lastUpdateRef.current < 100) {
      tickingRef.current = false;
      return;
    }
    lastUpdateRef.current = now;

    // Find the heading closest to the top of the container but still visible
    const containerRect = scrollContainer.getBoundingClientRect();
    const triggerPoint = containerRect.top + containerRect.height * 0.1; // 10% from top

    let bestId: string | null = null;
    let bestDistance = Infinity;

    for (const id of headingIds) {
      const el = document.getElementById(id);
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      // Check if heading is within the container viewport
      if (rect.bottom >= containerRect.top && rect.top <= containerRect.bottom) {
        // Prefer headings that are above or at the trigger point
        const distance = Math.abs(rect.top - triggerPoint);
        if (rect.top <= triggerPoint && distance < bestDistance) {
          bestDistance = distance;
          bestId = id;
        }
      }
    }

    // If no heading is above trigger point, use the first visible one
    if (!bestId) {
      for (const id of headingIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top >= containerRect.top && rect.top <= containerRect.bottom) {
          bestId = id;
          break;
        }
      }
    }

    setActiveHeadingId(bestId);
    tickingRef.current = false;
  }, [headingIds]);

  useEffect(() => {
    if (!container || headingIds.length === 0) {
      return;
    }

    // Find the actual scrollable container
    const scrollContainer = findScrollContainer(container);
    scrollContainerRef.current = scrollContainer;

    if (!scrollContainer) {
      return;
    }

    const handleScroll = () => {
      if (!tickingRef.current) {
        requestAnimationFrame(() => {
          findActiveHeading();
        });
        tickingRef.current = true;
      }
    };

    // Initial check
    findActiveHeading();

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup on unmount
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [container, headingIds, findActiveHeading]);

  return activeHeadingId;
}
