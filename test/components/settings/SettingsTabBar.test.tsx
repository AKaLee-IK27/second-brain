import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsTabBar } from '../../../src/components/settings/SettingsTabBar';

describe('SettingsTabBar', () => {
  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  it('renders both tabs', () => {
    render(<SettingsTabBar activeTab="shortcuts" onTabChange={mockOnTabChange} />);
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('highlights active tab with correct styling', () => {
    const { rerender } = render(<SettingsTabBar activeTab="shortcuts" onTabChange={mockOnTabChange} />);
    
    const shortcutsTab = screen.getByText('Keyboard Shortcuts').closest('button');
    const aboutTab = screen.getByText('About').closest('button');
    
    expect(shortcutsTab).toHaveClass('text-primary');
    expect(aboutTab).not.toHaveClass('text-primary');

    rerender(<SettingsTabBar activeTab="about" onTabChange={mockOnTabChange} />);
    
    expect(screen.getByText('Keyboard Shortcuts').closest('button')).not.toHaveClass('text-primary');
    expect(screen.getByText('About').closest('button')).toHaveClass('text-primary');
  });

  it('calls onTabChange with shortcuts when shortcuts tab is clicked', () => {
    render(<SettingsTabBar activeTab="about" onTabChange={mockOnTabChange} />);
    fireEvent.click(screen.getByText('Keyboard Shortcuts'));
    expect(mockOnTabChange).toHaveBeenCalledWith('shortcuts');
  });

  it('calls onTabChange with about when about tab is clicked', () => {
    render(<SettingsTabBar activeTab="shortcuts" onTabChange={mockOnTabChange} />);
    fireEvent.click(screen.getByText('About'));
    expect(mockOnTabChange).toHaveBeenCalledWith('about');
  });

  it('handles ArrowRight key to move focus to next tab', () => {
    render(<SettingsTabBar activeTab="shortcuts" onTabChange={mockOnTabChange} />);
    const shortcutsTab = screen.getByText('Keyboard Shortcuts').closest('button');
    
    shortcutsTab?.focus();
    fireEvent.keyDown(shortcutsTab!, { key: 'ArrowRight' });
    
    expect(document.activeElement).toBe(screen.getByText('About'));
  });

  it('handles ArrowLeft key to move focus to previous tab', () => {
    render(<SettingsTabBar activeTab="about" onTabChange={mockOnTabChange} />);
    const aboutTab = screen.getByText('About').closest('button');
    
    aboutTab?.focus();
    fireEvent.keyDown(aboutTab!, { key: 'ArrowLeft' });
    
    expect(document.activeElement).toBe(screen.getByText('Keyboard Shortcuts'));
  });

  it('handles Space key to activate focused tab', () => {
    render(<SettingsTabBar activeTab="shortcuts" onTabChange={mockOnTabChange} />);
    const aboutTab = screen.getByText('About').closest('button');
    
    aboutTab?.focus();
    fireEvent.keyDown(aboutTab!, { key: ' ' });
    
    expect(mockOnTabChange).toHaveBeenCalledWith('about');
  });

  it('handles Enter key to activate focused tab', () => {
    render(<SettingsTabBar activeTab="shortcuts" onTabChange={mockOnTabChange} />);
    const aboutTab = screen.getByText('About').closest('button');
    
    aboutTab?.focus();
    fireEvent.keyDown(aboutTab!, { key: 'Enter' });
    
    expect(mockOnTabChange).toHaveBeenCalledWith('about');
  });

  it('wraps focus from last tab to first on ArrowRight', () => {
    render(<SettingsTabBar activeTab="about" onTabChange={mockOnTabChange} />);
    const aboutTab = screen.getByText('About').closest('button');
    
    aboutTab?.focus();
    fireEvent.keyDown(aboutTab!, { key: 'ArrowRight' });
    
    expect(document.activeElement).toBe(screen.getByText('Keyboard Shortcuts'));
  });

  it('wraps focus from first tab to last on ArrowLeft', () => {
    render(<SettingsTabBar activeTab="shortcuts" onTabChange={mockOnTabChange} />);
    const shortcutsTab = screen.getByText('Keyboard Shortcuts').closest('button');
    
    shortcutsTab?.focus();
    fireEvent.keyDown(shortcutsTab!, { key: 'ArrowLeft' });
    
    expect(document.activeElement).toBe(screen.getByText('About'));
  });
});
