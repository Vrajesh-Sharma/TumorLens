import { create } from 'zustand';

type ThemeMode = 'system' | 'light' | 'dark';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface AppState {
  isLoading: boolean;
  themeMode: ThemeMode;
  toasts: Toast[];
  isOnline: boolean;
  setLoading: (loading: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setOnline: (online: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  themeMode: 'dark',
  toasts: [],
  isOnline: true,
  setLoading: (isLoading) => set({ isLoading }),
  setThemeMode: (themeMode) => set({ themeMode }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Date.now().toString() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  setOnline: (isOnline) => set({ isOnline }),
}));
