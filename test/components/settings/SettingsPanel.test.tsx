import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPanel } from '../../../src/components/settings/SettingsPanel';
import { useUIStore } from '../../../src/state/ui-store';

// Mock the child components
vi.mock('../../../src/components/settings/SettingsTabBar', () => ({
  SettingsTabBar: ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => (
    <div data-testid="tab-bar">
      <button onClick={() => onTabChange('shortcuts')}>Shortcuts</button>
      <button onClick={() => onTabChange('about')}>About</button>
      <span>Active: {activeTab}</span>
    </div>
  ),
}));

vi.mock('../../../src/components/settings/HotkeyMapTab', () => ({
  HotkeyMapTab: () => <div data-testid="hotkey-map-tab">Hotkey Map</div>,
}));

vi.mock('../../../src/components/settings/AboutTab', () => ({
  AboutTab: () => <div data-testid="about-tab">About Tab</div>,
}));

describe('SettingsPanel', () => {
  beforeEach(() => {
    useUIStore.setState({
      settingsOpen: true,
      settingsTab: 'shortcuts',
      _settingsTriggerElement: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders when settingsOpen is true', () => {
    render(<SettingsPanel />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<SettingsPanel />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Settings');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'settings-title');
  });

  it('closes when backdrop is clicked', () => {
    const toggleSettings = vi.fn();
    useUIStore.setState({ toggleSettings });
    
    render(<SettingsPanel />);
    const backdrop = screen.getByTestId('backdrop');
    fireEvent.click(backdrop);
    
    expect(toggleSettings).toHaveBeenCalled();
  });

  it('closes when close button is clicked', () => {
    const toggleSettings = vi.fn();
    useUIStore.setState({ toggleSettings });
    
    render(<SettingsPanel />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(toggleSettings).toHaveBeenCalled();
  });

  it('renders the tab bar', () => {
    render(<SettingsPanel />);
    expect(screen.getByTestId('tab-bar')).toBeInTheDocument();
  });

  it('renders HotkeyMapTab when settingsTab is shortcuts', () => {
    useUIStore.setState({ settingsTab: 'shortcuts' });
    render(<SettingsPanel />);
    expect(screen.getByTestId('hotkey-map-tab')).toBeInTheDocument();
  });

  it('renders AboutTab when settingsTab is about', () => {
    useUIStore.setState({ settingsTab: 'about' });
    render(<SettingsPanel />);
    expect(screen.getByTestId('about-tab')).toBeInTheDocument();
  });

  it('has settings title with correct id for aria-labelledby', () => {
    render(<SettingsPanel />);
    const title = screen.getByText('Settings');
    expect(title).toHaveAttribute('id', 'settings-title');
  });
});
