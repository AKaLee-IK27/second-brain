import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollSpy } from '../../src/hooks/useScrollSpy';

describe('useScrollSpy', () => {
  let mockNow = 200;

  beforeEach(() => {
    mockNow = 200;
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockImplementation(() => mockNow);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(performance.now());
      return 0;
    });
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
    const container = { current: document.createElement('div') };
    const { result } = renderHook(() => useScrollSpy(container, []));
    expect(result.current).toBeNull();
  });

  it('observes heading elements and returns active heading ID', () => {
    const containerEl = document.createElement('div');
    containerEl.style.height = '500px';
    containerEl.style.overflow = 'auto';
    const heading1 = document.createElement('h1');
    const heading2 = document.createElement('h2');
    heading1.id = 'heading-1';
    heading2.id = 'heading-2';
    heading1.style.marginTop = '0px';
    heading2.style.marginTop = '600px';
    containerEl.appendChild(heading1);
    containerEl.appendChild(heading2);
    document.body.appendChild(containerEl);

    // Mock getBoundingClientRect for jsdom
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function() {
      if (this === containerEl) {
        return { top: 0, bottom: 500, height: 500, width: 500, left: 0, right: 500, x: 0, y: 0, toJSON: () => {} };
      }
      if (this === heading1) {
        return { top: 0, bottom: 50, height: 50, width: 500, left: 0, right: 500, x: 0, y: 0, toJSON: () => {} };
      }
      if (this === heading2) {
        return { top: 600, bottom: 650, height: 50, width: 500, left: 0, right: 500, x: 0, y: 600, toJSON: () => {} };
      }
      return originalGetBoundingClientRect.call(this);
    };

    // Mock scrollHeight and clientHeight for jsdom
    Object.defineProperty(containerEl, 'scrollHeight', { value: 700, writable: true });
    Object.defineProperty(containerEl, 'clientHeight', { value: 500, writable: true });

    const container = { current: containerEl };

    const { result } = renderHook(() =>
      useScrollSpy(container, ['heading-1', 'heading-2'])
    );

    // Initial value should be 'heading-1' (first visible heading)
    expect(result.current).toBe('heading-1');

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    document.body.removeChild(containerEl);
  });

  it('throttles updates to max 10 per second (100ms minimum)', () => {
    const containerEl = document.createElement('div');
    containerEl.style.height = '500px';
    containerEl.style.overflow = 'auto';
    const heading = document.createElement('h1');
    heading.id = 'test-heading';
    containerEl.appendChild(heading);
    document.body.appendChild(containerEl);

    // Mock getBoundingClientRect for jsdom
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function() {
      if (this === containerEl) {
        return { top: 0, bottom: 500, height: 500, width: 500, left: 0, right: 500, x: 0, y: 0, toJSON: () => {} };
      }
      if (this === heading) {
        return { top: 0, bottom: 50, height: 50, width: 500, left: 0, right: 500, x: 0, y: 0, toJSON: () => {} };
      }
      return originalGetBoundingClientRect.call(this);
    };

    // Mock scrollHeight and clientHeight for jsdom
    Object.defineProperty(containerEl, 'scrollHeight', { value: 600, writable: true });
    Object.defineProperty(containerEl, 'clientHeight', { value: 500, writable: true });

    const container = { current: containerEl };

    const { result } = renderHook(() =>
      useScrollSpy(container, ['test-heading'])
    );

    // Initial value should be 'test-heading'
    expect(result.current).toBe('test-heading');

    // Fire scroll event immediately - should be throttled
    act(() => {
      containerEl.dispatchEvent(new Event('scroll'));
    });

    // Should still be 'test-heading'
    expect(result.current).toBe('test-heading');

    // Advance time past throttle window
    act(() => {
      advanceTime(100);
      containerEl.dispatchEvent(new Event('scroll'));
    });

    // Should still be 'test-heading'
    expect(result.current).toBe('test-heading');

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    document.body.removeChild(containerEl);
  });

  it('returns null when heading is not visible', () => {
    const containerEl = document.createElement('div');
    containerEl.style.height = '100px';
    containerEl.style.overflow = 'auto';
    const heading = document.createElement('h1');
    heading.id = 'top-heading';
    heading.style.marginTop = '500px'; // Outside viewport
    containerEl.appendChild(heading);
    document.body.appendChild(containerEl);

    // Mock getBoundingClientRect for jsdom
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function() {
      if (this === containerEl) {
        return { top: 0, bottom: 100, height: 100, width: 500, left: 0, right: 500, x: 0, y: 0, toJSON: () => {} };
      }
      if (this === heading) {
        return { top: 500, bottom: 550, height: 50, width: 500, left: 0, right: 500, x: 0, y: 500, toJSON: () => {} };
      }
      return originalGetBoundingClientRect.call(this);
    };

    // Mock scrollHeight and clientHeight for jsdom
    Object.defineProperty(containerEl, 'scrollHeight', { value: 600, writable: true });
    Object.defineProperty(containerEl, 'clientHeight', { value: 100, writable: true });

    const container = { current: containerEl };

    const { result } = renderHook(() =>
      useScrollSpy(container, ['top-heading'])
    );

    // Heading is not visible, should be null
    expect(result.current).toBeNull();

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    document.body.removeChild(containerEl);
  });

  it('cleans up scroll listener on unmount', () => {
    const containerEl = document.createElement('div');
    containerEl.style.height = '500px';
    containerEl.style.overflow = 'auto';
    const heading = document.createElement('h1');
    heading.id = 'cleanup-test';
    containerEl.appendChild(heading);
    document.body.appendChild(containerEl);

    // Mock getBoundingClientRect for jsdom
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function() {
      if (this === containerEl) {
        return { top: 0, bottom: 500, height: 500, width: 500, left: 0, right: 500, x: 0, y: 0, toJSON: () => {} };
      }
      if (this === heading) {
        return { top: 0, bottom: 50, height: 50, width: 500, left: 0, right: 500, x: 0, y: 0, toJSON: () => {} };
      }
      return originalGetBoundingClientRect.call(this);
    };

    // Mock scrollHeight and clientHeight for jsdom
    Object.defineProperty(containerEl, 'scrollHeight', { value: 600, writable: true });
    Object.defineProperty(containerEl, 'clientHeight', { value: 500, writable: true });

    const container = { current: containerEl };

    const removeEventListenerSpy = vi.spyOn(containerEl, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useScrollSpy(container, ['cleanup-test'])
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    document.body.removeChild(containerEl);
  });
});
