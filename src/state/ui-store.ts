import { create } from 'zustand';

export type RightPanelTab = 'info' | 'backlinks' | 'graph' | 'outline';

interface UIState {
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: RightPanelTab;
  focusMode: boolean;
  commandPaletteOpen: boolean;
  shortcutHelpOpen: boolean;
  graphOverlayOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  toggleFocusMode: () => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleShortcutHelp: () => void;
  toggleGraphOverlay: () => void;
  setGraphOverlayOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  rightPanelOpen: true,
  rightPanelTab: 'info',
  focusMode: false,
  commandPaletteOpen: false,
  shortcutHelpOpen: false,
  graphOverlayOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleShortcutHelp: () => set((state) => ({ shortcutHelpOpen: !state.shortcutHelpOpen })),
  toggleGraphOverlay: () => set((state) => ({ graphOverlayOpen: !state.graphOverlayOpen })),
  setGraphOverlayOpen: (open) => set({ graphOverlayOpen: open }),
}));
