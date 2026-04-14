import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook that tracks which heading is currently visible in the viewport.
 * Uses IntersectionObserver for performance, with throttling to avoid re-render storms.
 *
 * @param containerRef - The scroll container element to observe within
 * @param headingIds - Array of heading IDs to track
 * @returns The ID of the currently active heading, or null if none is visible
 */
export function useScrollSpy(
  containerRef: React.RefObject<HTMLElement | null> | HTMLElement | null,
  headingIds: string[]
): string | null {
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Normalize containerRef to always be an HTMLElement or null
  const container = containerRef instanceof HTMLElement ? containerRef : containerRef?.current || null;

  const updateActiveHeading = useCallback((entries: IntersectionObserverEntry[]) => {
    const now = performance.now();
    // Throttle to max 10 updates per second (100ms minimum interval)
    if (now - lastUpdateRef.current < 100) {
      return;
    }
    lastUpdateRef.current = now;

    // Find the heading with the highest intersection ratio that's visible
    let bestEntry: IntersectionObserverEntry | null = null;
    let bestRatio = 0;

    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
        bestRatio = entry.intersectionRatio;
        bestEntry = entry;
      }
    }

    if (bestEntry && bestEntry.target.id) {
      setActiveHeadingId(bestEntry.target.id);
    } else {
      setActiveHeadingId(null);
    }
  }, []);

  useEffect(() => {
    if (!container || headingIds.length === 0) {
      return;
    }

    // Create IntersectionObserver with root margin targeting top portion of container
    observerRef.current = new IntersectionObserver(
      (entries) => {
        updateActiveHeading(entries);
      },
      {
        root: container,
        rootMargin: '-10% 0px -80% 0px', // Only observe the top 10% of the viewport
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all heading elements
    const headingElements = headingIds
      .map((id) => container.querySelector(`[id="${id}"]`))
      .filter((el): el is Element => el !== null);

    headingElements.forEach((heading) => {
      observerRef.current?.observe(heading);
    });

    // Cleanup on unmount
    return () => {
      observerRef.current?.disconnect();
    };
  }, [container, headingIds, updateActiveHeading]);

  return activeHeadingId;
}
