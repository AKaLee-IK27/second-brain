import { useRef, useCallback } from 'react';

interface SettingsTabBarProps {
  activeTab: 'shortcuts' | 'about';
  onTabChange: (tab: 'shortcuts' | 'about') => void;
}

const TABS: { key: 'shortcuts' | 'about'; label: string }[] = [
  { key: 'shortcuts', label: 'Keyboard Shortcuts' },
  { key: 'about', label: 'About' },
];

export function SettingsTabBar({ activeTab, onTabChange }: SettingsTabBarProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentIndex: number) => {
    const tabs = tabRefs.current;
    const tabCount = tabs.length;

    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabCount;
        tabs[nextIndex]?.focus();
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabCount) % tabCount;
        tabs[prevIndex]?.focus();
        break;
      }
      case ' ':
      case 'Enter': {
        e.preventDefault();
        onTabChange(TABS[currentIndex].key);
        break;
      }
    }
  }, [onTabChange]);

  return (
    <div className="flex border-b border-outline-variant/15" role="tablist">
      {TABS.map((tab, index) => (
        <button
          key={tab.key}
          ref={(el) => { tabRefs.current[index] = el; }}
          role="tab"
          aria-selected={activeTab === tab.key}
          aria-controls={`tabpanel-${tab.key}`}
          tabIndex={activeTab === tab.key ? 0 : -1}
          onClick={() => onTabChange(tab.key)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={`px-4 py-2 text-sm ${
            activeTab === tab.key
              ? 'text-primary border-b-2 border-primary font-medium'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
