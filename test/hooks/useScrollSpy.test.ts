import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollSpy } from '../../src/hooks/useScrollSpy';

describe('useScrollSpy', () => {
  let mockNow = 200;

  beforeEach(() => {
    mockNow = 200;
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockImplementation(() => mockNow);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  const advanceTime = (ms: number) => {
    mockNow += ms;
    vi.advanceTimersByTime(ms);
  };

  it('returns null when no container is provided', () => {
    const { result } = renderHook(() => useScrollSpy(null, []));
    expect(result.current).toBeNull();
  });

  it('returns null when no heading IDs are provided', () => {
    const container = document.createElement('div');
    const { result } = renderHook(() => useScrollSpy(container, []));
    expect(result.current).toBeNull();
  });

  it('observes heading elements and returns active heading ID', () => {
    const container = document.createElement('div');
    const heading1 = document.createElement('h1');
    const heading2 = document.createElement('h2');
    heading1.id = 'heading-1';
    heading2.id = 'heading-2';
    container.appendChild(heading1);
    container.appendChild(heading2);

    let observerCallback: ((entries: any[]) => void) | null = null;
    const mockDisconnect = vi.fn();

    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = mockDisconnect;
      unobserve = vi.fn();
      constructor(callback: (entries: any[]) => void) {
        observerCallback = callback;
      }
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    const { result } = renderHook(() =>
      useScrollSpy(container, ['heading-1', 'heading-2'])
    );

    // Initial value should be null
    expect(result.current).toBeNull();

    // Manually fire the observer callback
    act(() => {
      if (observerCallback) {
        observerCallback([{
          target: heading1,
          intersectionRatio: 0.8,
          isIntersecting: true,
        }, {
          target: heading2,
          intersectionRatio: 0.2,
          isIntersecting: true,
        }]);
      }
    });

    expect(result.current).toBe('heading-1');
  });

  it('throttles updates to max 10 per second (100ms minimum)', () => {
    const container = document.createElement('div');
    const heading = document.createElement('h1');
    heading.id = 'test-heading';
    container.appendChild(heading);

    let observerCallback: ((entries: any[]) => void) | null = null;

    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      constructor(callback: (entries: any[]) => void) {
        observerCallback = callback;
      }
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    const { result } = renderHook(() =>
      useScrollSpy(container, ['test-heading'])
    );

    // Fire observer callback - should update since 200ms > 100ms threshold
    act(() => {
      if (observerCallback) {
        observerCallback([{
          target: heading,
          intersectionRatio: 1.0,
          isIntersecting: true,
        }]);
      }
    });

    expect(result.current).toBe('test-heading');

    // Fire again immediately - should be throttled
    act(() => {
      if (observerCallback) {
        observerCallback([{
          target: heading,
          intersectionRatio: 0.5,
          isIntersecting: true,
        }]);
      }
    });

    // Should still be 'test-heading' (not updated due to throttle)
    expect(result.current).toBe('test-heading');

    // Advance time past throttle window
    act(() => {
      advanceTime(100);
      if (observerCallback) {
        observerCallback([{
          target: heading,
          intersectionRatio: 0.8,
          isIntersecting: true,
        }]);
      }
    });

    // Should still be 'test-heading' (same heading)
    expect(result.current).toBe('test-heading');
  });

  it('returns null when heading is above viewport midpoint', () => {
    const container = document.createElement('div');
    const heading = document.createElement('h1');
    heading.id = 'top-heading';
    container.appendChild(heading);

    let observerCallback: ((entries: any[]) => void) | null = null;

    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      constructor(callback: (entries: any[]) => void) {
        observerCallback = callback;
      }
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    const { result } = renderHook(() =>
      useScrollSpy(container, ['top-heading'])
    );

    act(() => {
      if (observerCallback) {
        observerCallback([{
          target: heading,
          intersectionRatio: 0,
          isIntersecting: false,
        }]);
      }
    });

    expect(result.current).toBeNull();
  });

  it('cleans up observer on unmount', () => {
    const container = document.createElement('div');
    const heading = document.createElement('h1');
    heading.id = 'cleanup-test';
    container.appendChild(heading);

    const mockDisconnect = vi.fn();

    class MockIntersectionObserver {
      observe = vi.fn();
      disconnect = mockDisconnect;
      unobserve = vi.fn();
      constructor(_callback: (entries: any[]) => void) {}
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    const { unmount } = renderHook(() =>
      useScrollSpy(container, ['cleanup-test'])
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
