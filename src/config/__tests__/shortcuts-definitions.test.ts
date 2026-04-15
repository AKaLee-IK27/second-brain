import { describe, it, expect, afterEach } from 'vitest';
import { 
  SHORTCUT_DEFINITIONS, 
  getDisplayKeys, 
  getShortcutsByCategory,
  type ShortcutDefinition 
} from '../shortcuts-definitions';

describe('shortcuts-definitions', () => {
  describe('SHORTCUT_DEFINITIONS', () => {
    it('contains all required shortcuts', () => {
      expect(SHORTCUT_DEFINITIONS.length).toBeGreaterThan(0);
    });

    it('has unique IDs for all shortcuts', () => {
      const ids = SHORTCUT_DEFINITIONS.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('has valid categories for all shortcuts', () => {
      const validCategories = ['global', 'navigation', 'editor'];
      SHORTCUT_DEFINITIONS.forEach(shortcut => {
        expect(validCategories).toContain(shortcut.category);
      });
    });

    it('has non-empty keys arrays', () => {
      SHORTCUT_DEFINITIONS.forEach(shortcut => {
        expect(shortcut.keys).toBeDefined();
        expect(shortcut.keys.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getDisplayKeys', () => {
    const originalPlatform = navigator.platform;

    afterEach(() => {
      Object.defineProperty(navigator, 'platform', {
        value: originalPlatform,
        writable: true,
      });
    });

    it('returns macOS-style keys on Mac platform', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
      });

      const shortcut: ShortcutDefinition = {
        id: 'test',
        action: 'Test',
        category: 'global',
        keys: ['Ctrl', 'K'],
      };

      const result = getDisplayKeys(shortcut);
      expect(result).toEqual(['⌘', 'K']);
    });

    it('returns standard keys on non-Mac platform', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        writable: true,
      });

      const shortcut: ShortcutDefinition = {
        id: 'test',
        action: 'Test',
        category: 'global',
        keys: ['Ctrl', 'K'],
      };

      const result = getDisplayKeys(shortcut);
      expect(result).toEqual(['Ctrl', 'K']);
    });

    it('handles Ctrl+Shift combinations on Mac', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
      });

      const shortcut: ShortcutDefinition = {
        id: 'test',
        action: 'Test',
        category: 'global',
        keys: ['Ctrl', 'Shift', '?'],
      };

      const result = getDisplayKeys(shortcut);
      expect(result).toEqual(['⌘', '⇧', '?']);
    });

    it('handles single key shortcuts', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
      });

      const shortcut: ShortcutDefinition = {
        id: 'test',
        action: 'Test',
        category: 'navigation',
        keys: ['G'],
      };

      const result = getDisplayKeys(shortcut);
      expect(result).toEqual(['G']);
    });
  });

  describe('getShortcutsByCategory', () => {
    it('returns an object with all category keys', () => {
      const result = getShortcutsByCategory();
      expect(result).toHaveProperty('global');
      expect(result).toHaveProperty('navigation');
      expect(result).toHaveProperty('editor');
    });

    it('groups shortcuts by their category', () => {
      const result = getShortcutsByCategory();
      
      // Verify each shortcut is in the correct category
      SHORTCUT_DEFINITIONS.forEach(shortcut => {
        expect(result[shortcut.category]).toContainEqual(shortcut);
      });
    });

    it('returns arrays for each category', () => {
      const result = getShortcutsByCategory();
      expect(Array.isArray(result.global)).toBe(true);
      expect(Array.isArray(result.navigation)).toBe(true);
      expect(Array.isArray(result.editor)).toBe(true);
    });
  });
});
