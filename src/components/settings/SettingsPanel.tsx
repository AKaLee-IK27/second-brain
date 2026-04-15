import { useEffect, useRef, useCallback } from 'react';
import { useUIStore } from '../../state/ui-store';
import { MaterialIcon } from '../shared/MaterialIcon';
import { SettingsTabBar } from './SettingsTabBar';
import { HotkeyMapTab } from './HotkeyMapTab';
import { AboutTab } from './AboutTab';

export function SettingsPanel() {
  const { settingsOpen, settingsTab, toggleSettings, _settingsTriggerElement } = useUIStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus close button on mount
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // Focus restoration on unmount
  useEffect(() => {
    return () => {
      if (_settingsTriggerElement) {
        _settingsTriggerElement.focus();
      }
    };
  }, [_settingsTriggerElement]);

  // Focus trap
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [handleTabKey]);

  if (!settingsOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="backdrop"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={toggleSettings}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Settings"
        aria-labelledby="settings-title"
        aria-modal="true"
        className="fixed right-0 top-12 bottom-0 w-96 bg-surface-container-highest border-l border-outline-variant/15 shadow-sb-xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/15">
          <h2 id="settings-title" className="font-headline font-semibold text-lg text-on-surface">
            Settings
          </h2>
          <button
            ref={closeBtnRef}
            onClick={toggleSettings}
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
            aria-label="Close settings"
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        {/* Tab Bar */}
        <SettingsTabBar
          activeTab={settingsTab}
          onTabChange={(tab) => useUIStore.getState().setSettingsTab(tab)}
        />

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {settingsTab === 'shortcuts' && <HotkeyMapTab />}
          {settingsTab === 'about' && <AboutTab />}
        </div>
      </div>
    </>
  );
}
