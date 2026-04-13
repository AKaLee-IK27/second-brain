import { create } from 'zustand';

interface AppState {
  dataRoot: string | null;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  sessionCount: number;
  watcherStatus: 'watching' | 'error' | 'idle';
  setDataRoot: (path: string) => void;
  clearDataRoot: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSessionCount: (count: number) => void;
  setWatcherStatus: (status: 'watching' | 'error' | 'idle') => void;
}

export const useAppStore = create<AppState>((set) => ({
  dataRoot: localStorage.getItem('akl-data-root'),
  isConfigured: !!localStorage.getItem('akl-data-root'),
  isLoading: false,
  error: null,
  sessionCount: 0,
  watcherStatus: 'idle',
  setDataRoot: (path) => {
    localStorage.setItem('akl-data-root', path);
    set({ dataRoot: path, isConfigured: true, error: null });
  },
  clearDataRoot: () => {
    localStorage.removeItem('akl-data-root');
    set({ dataRoot: null, isConfigured: false });
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSessionCount: (count) => set({ sessionCount: count }),
  setWatcherStatus: (status) => set({ watcherStatus: status }),
}));
