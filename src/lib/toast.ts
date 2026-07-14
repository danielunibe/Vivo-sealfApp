export type ToastType = 'success' | 'error' | 'info';

export const toast = (message: string, type: ToastType = 'info') => {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }));
};
