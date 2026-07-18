import { useAppStore } from '../store/appStore';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export function showToast(options: ToastOptions) {
  const { message, type = 'info', duration = 3000 } = options;
  useAppStore.getState().addToast({ message, type, duration });
}

export function showSuccess(message: string) {
  showToast({ message, type: 'success' });
}

export function showError(message: string) {
  showToast({ message, type: 'error', duration: 5000 });
}

export function showWarning(message: string) {
  showToast({ message, type: 'warning' });
}

export function showInfo(message: string) {
  showToast({ message, type: 'info' });
}
