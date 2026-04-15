import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../../src/state/ui-store';

describe('ui-store - settings', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useUIStore.setState({
      settingsOpen: false,
      settingsTab: 'shortcuts',
    });
  });

  describe('toggleSettings', () => {
    it('toggles settingsOpen from false to true', () => {
      const initialState = useUIStore.getState().settingsOpen;
      expect(initialState).toBe(false);

      useUIStore.getState().toggleSettings();

      expect(useUIStore.getState().settingsOpen).toBe(true);
    });

    it('toggles settingsOpen from true to false', () => {
      useUIStore.setState({ settingsOpen: true });
      expect(useUIStore.getState().settingsOpen).toBe(true);

      useUIStore.getState().toggleSettings();

      expect(useUIStore.getState().settingsOpen).toBe(false);
    });

    it('resets settingsTab to shortcuts when opening', () => {
      useUIStore.setState({ settingsTab: 'about' });
      expect(useUIStore.getState().settingsTab).toBe('about');

      useUIStore.setState({ settingsOpen: false });
      useUIStore.getState().toggleSettings();

      expect(useUIStore.getState().settingsTab).toBe('shortcuts');
    });

    it('auto-closes shortcutHelp when opening settings', () => {
      useUIStore.setState({ shortcutHelpOpen: true, settingsOpen: false });
      expect(useUIStore.getState().shortcutHelpOpen).toBe(true);

      useUIStore.getState().toggleSettings();

      expect(useUIStore.getState().shortcutHelpOpen).toBe(false);
      expect(useUIStore.getState().settingsOpen).toBe(true);
    });
  });

  describe('setSettingsTab', () => {
    it('sets settingsTab to shortcuts', () => {
      useUIStore.getState().setSettingsTab('shortcuts');
      expect(useUIStore.getState().settingsTab).toBe('shortcuts');
    });

    it('sets settingsTab to about', () => {
      useUIStore.getState().setSettingsTab('about');
      expect(useUIStore.getState().settingsTab).toBe('about');
    });
  });

  describe('initial state', () => {
    it('settingsOpen can be set to false', () => {
      useUIStore.setState({ settingsOpen: false });
      expect(useUIStore.getState().settingsOpen).toBe(false);
    });

    it('settingsTab can be set to shortcuts', () => {
      useUIStore.setState({ settingsTab: 'shortcuts' });
      expect(useUIStore.getState().settingsTab).toBe('shortcuts');
    });
  });
});
